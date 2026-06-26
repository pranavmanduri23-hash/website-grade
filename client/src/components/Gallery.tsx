import { useState, useRef, useEffect } from 'react';
import { Upload, Trash2, X, ChevronLeft, ChevronRight, Download, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface GalleryImage {
  id: string;
  src: string;
  title: string;
  description: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface GalleryProps {
  isAdmin: boolean;
}

export default function Gallery({ isAdmin }: GalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedData = data?.map(img => ({
        id: img.id,
        src: img.image_url,
        title: img.title,
        description: img.description,
        uploadedAt: img.created_at,
        uploadedBy: img.uploaded_by || 'Admin'
      })) || [];
      
      setImages(formattedData);
    } catch (error: any) {
      console.error('Error fetching gallery:', error);
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
    setShowLightbox(true);
  };

  const handlePreviousImage = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const previousIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setSelectedImage(images[previousIndex]);
  };

  const handleNextImage = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % images.length;
    setSelectedImage(images[nextIndex]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleUploadImage = async () => {
    if (!uploadTitle.trim() || !uploadedFile) {
      toast.error('Please fill in title and select an image');
      return;
    }

    try {
      setIsUploading(true);
      
      // 1. Upload to Storage
      const fileExt = uploadedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('teacher-pictures') // Using existing bucket for convenience
        .upload(filePath, uploadedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('teacher-pictures')
        .getPublicUrl(filePath);

      // 2. Save to Database
      const { error: dbError } = await supabase
        .from('gallery')
        .insert([{
          title: uploadTitle,
          description: uploadDescription,
          image_url: publicUrl,
          uploaded_by: 'Admin'
        }]);

      if (dbError) throw dbError;

      toast.success('Image uploaded successfully!');
      fetchImages();
      setShowUploadDialog(false);
      setUploadTitle('');
      setUploadDescription('');
      setUploadedFile(null);
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    
    try {
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setImages(images.filter(img => img.id !== id));
      if (selectedImage?.id === id) {
        setShowLightbox(false);
        setSelectedImage(null);
      }
      toast.success('Image deleted');
    } catch (error: any) {
      toast.error(error.message || 'Delete failed');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingImage || !uploadTitle.trim()) {
      toast.error('Please fill in the title');
      return;
    }

    try {
      const { error } = await supabase
        .from('gallery')
        .update({
          title: uploadTitle,
          description: uploadDescription
        })
        .eq('id', editingImage.id);

      if (error) throw error;

      toast.success('Image updated successfully!');
      fetchImages();
      setShowEditDialog(false);
    } catch (error: any) {
      toast.error(error.message || 'Update failed');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <div className="text-center py-10">Loading gallery...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Class Gallery</h2>
        {isAdmin && (
          <Button
            onClick={() => {
              setUploadTitle('');
              setUploadDescription('');
              setUploadedFile(null);
              setShowUploadDialog(true);
            }}
            className="neon-button gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Photo
          </Button>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.length === 0 ? (
          <div className="col-span-full text-center py-12 rounded-lg" style={{
            background: 'rgba(24, 28, 50, 0.4)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(37, 80, 140, 0.4)',
            border: '1px solid'
          }}>
            <p className="text-muted-foreground">No photos yet. {isAdmin && 'Upload your first photo!'}</p>
          </div>
        ) : (
          images.map(image => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300"
              style={{
                background: 'rgba(24, 28, 50, 0.4)',
                backdropFilter: 'blur(12px)',
                borderColor: 'rgba(37, 80, 140, 0.4)',
                border: '1px solid'
              }}
              onClick={() => handleImageClick(image)}
            >
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-white font-semibold mb-1">{image.title}</h3>
                <p className="text-xs text-gray-300 mb-2 line-clamp-2">{image.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatDate(image.uploadedAt)}</span>
                  <span>{image.uploadedBy}</span>
                </div>
              </div>

              {isAdmin && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-primary/20 hover:bg-primary/40 text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingImage(image);
                      setUploadTitle(image.title);
                      setUploadDescription(image.description);
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-destructive/20 hover:bg-destructive/40 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(image.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Lightbox, Upload, and Edit Dialogs (kept from original but updated to use Supabase) */}
      <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
        <DialogContent className="max-w-4xl" style={{
          background: 'rgba(24, 28, 50, 0.95)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(0, 212, 255, 0.5)',
          border: '1px solid'
        }}>
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-primary">{selectedImage?.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative w-full max-h-96 overflow-hidden rounded-lg">
              {selectedImage && (
                <img
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="w-full h-auto object-contain"
                />
              )}
            </div>

            {selectedImage && (
              <div className="space-y-2">
                <p className="text-foreground">{selectedImage.description}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Uploaded by {selectedImage.uploadedBy} on {formatDate(selectedImage.uploadedAt)}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <Button variant="outline" size="icon" onClick={handlePreviousImage} className="text-primary"><ChevronLeft className="w-4 h-4" /></Button>
              <div className="flex gap-2">
                {isAdmin && selectedImage && (
                  <Button variant="outline" size="sm" onClick={() => handleDeleteImage(selectedImage.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
                )}
                <Button variant="outline" size="sm" onClick={() => window.open(selectedImage?.src, '_blank')} className="text-primary"><Download className="w-4 h-4 mr-2" />Download</Button>
              </div>
              <Button variant="outline" size="icon" onClick={handleNextImage} className="text-primary"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent style={{ background: 'rgba(24, 28, 50, 0.9)', backdropFilter: 'blur(12px)', borderColor: 'rgba(0, 212, 255, 0.5)', border: '1px solid' }}>
          <DialogHeader><DialogTitle className="text-primary">Upload New Photo</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <Input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Title" className="bg-slate-900/50 border-slate-700" />
            <Input value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} placeholder="Description" className="bg-slate-900/50 border-slate-700" />
            <Input type="file" accept="image/*" onChange={handleFileSelect} className="bg-slate-900/50 border-slate-700 cursor-pointer" />
            <Button onClick={handleUploadImage} disabled={isUploading} className="w-full neon-button">{isUploading ? 'Uploading...' : 'Upload'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent style={{ background: 'rgba(24, 28, 50, 0.9)', backdropFilter: 'blur(12px)', borderColor: 'rgba(0, 212, 255, 0.5)', border: '1px solid' }}>
          <DialogHeader><DialogTitle className="text-primary">Edit Photo Info</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <Input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Title" className="bg-slate-900/50 border-slate-700" />
            <Input value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} placeholder="Description" className="bg-slate-900/50 border-slate-700" />
            <Button onClick={handleSaveEdit} className="w-full neon-button">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
