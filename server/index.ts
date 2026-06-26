import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import multer from "multer";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const UPLOADS_DIR = path.resolve(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Ensure data directory exists for persistence
const DATA_DIR = path.resolve(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const PRESENTATIONS_FILE = path.join(DATA_DIR, "presentations.json");
if (!fs.existsSync(PRESENTATIONS_FILE)) {
  fs.writeFileSync(PRESENTATIONS_FILE, JSON.stringify([]));
}

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pptx' || ext === '.ppt' || ext === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only presentations (PPTX, PPT, PDF) are allowed'));
    }
  }
});

// Groq API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function callGroqAPI(messages: any[]) {
  try {
    const response = await axios.post(GROQ_API_URL, {
      model: 'mixtral-8x7b-32768',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
      stream: true,
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      responseType: 'stream'
    });

    return response.data;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const server = createServer(app);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));
  
  // Serve uploaded files
  app.use("/uploads", express.static(UPLOADS_DIR));

  // Groq Chat API endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, conversationHistory } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      if (!GROQ_API_KEY) {
        return res.status(500).json({ error: "Groq API key not configured" });
      }

      // Build messages array
      const messages = [
        {
          role: 'system',
          content: 'You are ClassBot, a helpful AI assistant for a school class. You help students with their studies, answer questions about school subjects, provide motivation, and assist with general knowledge. Be friendly, encouraging, and concise in your responses. Keep responses under 150 words when possible.'
        },
        ...(conversationHistory || []),
        {
          role: 'user',
          content: message
        }
      ];

      // Set response headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
        const stream = await callGroqAPI(messages);

        stream.on('data', (chunk: any) => {
          const payload = chunk.toString();
          const lines = payload.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  res.write(content);
                }
              } catch (e) {
                // Ignore parsing errors for partial chunks
              }
            }
          }
        });

        stream.on('end', () => {
          res.end();
        });

        stream.on('error', (err: any) => {
          console.error('Stream error:', err);
          res.write('\n[Error during streaming]');
          res.end();
        });
      } catch (error) {
        console.error('Error streaming from Groq:', error);
        res.write('Sorry, I encountered an error. Please try again later.');
        res.end();
      }
    } catch (error) {
      console.error('Error in chat endpoint:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // API Routes for presentations
  app.get("/api/presentations", (_req, res) => {
    const data = fs.readFileSync(PRESENTATIONS_FILE, "utf-8");
    res.json(JSON.parse(data));
  });

  app.post("/api/presentations", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const presentations = JSON.parse(fs.readFileSync(PRESENTATIONS_FILE, "utf-8"));
    const newPresentation = {
      id: Date.now().toString(),
      title: req.body.title || req.file.originalname,
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
      uploadDate: new Date().toISOString()
    };

    presentations.push(newPresentation);
    fs.writeFileSync(PRESENTATIONS_FILE, JSON.stringify(presentations, null, 2));
    
    res.json(newPresentation);
  });

  app.delete("/api/presentations/:id", (req, res) => {
    const { id } = req.params;
    let presentations = JSON.parse(fs.readFileSync(PRESENTATIONS_FILE, "utf-8"));
    const pres = presentations.find((p: any) => p.id === id);
    
    if (pres) {
      const filePath = path.join(UPLOADS_DIR, pres.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      presentations = presentations.filter((p: any) => p.id !== id);
      fs.writeFileSync(PRESENTATIONS_FILE, JSON.stringify(presentations, null, 2));
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Presentation not found" });
    }
  });

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return res.status(404).send("Not found");
    }
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    if (GROQ_API_KEY) {
      console.log('Groq API is configured and ready');
    } else {
      console.warn('Warning: GROQ_API_KEY not set. Chat functionality will not work.');
    }
  });
}

startServer().catch(console.error);
