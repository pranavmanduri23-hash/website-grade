import { useState, useEffect } from 'react';
import { Presentation, Upload, Trash2, ExternalLink, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface PresentationData {
  id: string;
  title: string;
  url: string;
  created_at: string;
}

interface PresentationBoardProps {
  isAdmin: boolean;
}

export default function PresentationBoard({ isAdmin }: PresentationBoardProps) {
  const [presentations, setPresentations] = useState<PresentationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [activePres, setActivePres] = useState<PresentationData | null>(null);

  useEffect(() => {
    fetchPresentations();
  }, []);

  const fetchPresentations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('presentations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPresentations(data || []);
    } catch (error: any) {
      console.error('Failed to fetch presentations:', error);
      toast.error('Failed to load presentations');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      if (!uploadTitle) {
        setUploadTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setIsUploading(true);
      
      // 1. Upload to Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `presentations/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('teacher-pictures') // Using same bucket for simplicity
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('teacher-pictures')
        .getPublicUrl(filePath);

      // 2. Save to Database
      const { error: dbError } = await supabase
        .from('presentations')
        .insert([{
          title: uploadTitle,
          url: publicUrl
        }]);

      if (dbError) throw dbError;

      toast.success('Presentation uploaded successfully!');
      setUploadTitle('');
      setSelectedFile(null);
      fetchPresentations();
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this presentation?')) return;

    try {
      const { error } = await supabase
        .from('presentations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Deleted successfully');
      setPresentations(presentations.filter(p => p.id !== id));
    } catch (error: any) {
      toast.error(error.message || 'Delete failed');
    }
  };

  const openViewer = (pres: PresentationData) => {
    setActivePres(pres);
    setShowViewer(true);
  };

  if (loading) return <div className="text-center py-10">Loading presentations...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Presentation className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground">Presentations</h2>
        </div>

        {isAdmin && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="neon-button gap-2">
                <Upload className="w-4 h-4" />
                Upload PPTX
              </Button>
            </DialogTrigger>
            <DialogContent style={{ background: 'rgba(24, 28, 50, 0.9)', backdropFilter: 'blur(12px)', borderColor: 'rgba(0, 212, 255, 0.5)', border: '1px solid' }}>
              <DialogHeader><DialogTitle className="text-primary">Upload New Presentation</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <Input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Title" className="bg-slate-900/50 border-slate-700" />
                <Input type="file" accept=".pptx,.ppt,.pdf" onChange={handleFileChange} className="bg-slate-900/50 border-slate-700 cursor-pointer" />
                <Button onClick={handleUpload} disabled={isUploading} className="w-full neon-button">{isUploading ? 'Uploading...' : 'Upload'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {presentations.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
          <Presentation className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-muted-foreground">No presentations yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presentations.map((pres) => (
            <div key={pres.id} className="group p-6 rounded-xl border" style={{ background: 'rgba(24, 28, 50, 0.4)', backdropFilter: 'blur(12px)', borderColor: 'rgba(37, 80, 140, 0.4)', border: '1px solid' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="bg-primary/20 p-3 rounded-lg"><Presentation className="w-6 h-6 text-primary" /></div>
                {isAdmin && (
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(pres.id)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <h3 className="font-bold text-foreground text-lg mb-1 truncate">{pres.title}</h3>
              <p className="text-xs text-muted-foreground mb-4">Uploaded: {new Date(pres.created_at).toLocaleDateString()}</p>
              <div className="flex gap-2">
                <Button onClick={() => openViewer(pres)} className="flex-1 neon-button gap-2 text-xs h-9"><Play className="w-3 h-3" />Present</Button>
                <Button variant="outline" size="icon" className="h-9 w-9 border-slate-700 hover:bg-slate-800" asChild>
                  <a href={pres.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /></a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showViewer} onOpenChange={setShowViewer}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 overflow-hidden bg-black border-slate-800">
          <DialogHeader className="p-4 bg-slate-900 border-b border-slate-800">
            <DialogTitle className="text-primary truncate">Presenting: {activePres?.title}</DialogTitle>
          </DialogHeader>
          <div className="w-full h-full bg-slate-950 flex items-center justify-center">
            {activePres && (
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(activePres.url)}`}
                width="100%" height="100%" frameBorder="0" title="Viewer"
              ></iframe>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
