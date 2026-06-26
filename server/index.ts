import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import multer from "multer";

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

  // API Routes
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
  });
}

startServer().catch(console.error);
