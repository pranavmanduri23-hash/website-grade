import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getTeachers, addTeacher, deleteTeacher, uploadTeacherPicture, type Teacher } from '@/lib/supabase';

interface TeachersProps {
  isAdmin: boolean;
}

export default function Teachers({ isAdmin }: TeachersProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const data = await getTeachers();
      setTeachers(data);
    } catch (error) {
      console.error('Error loading teachers:', error);
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async () => {
    if (!newTeacherName.trim()) {
      toast.error('Please enter a teacher name');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a picture');
      return;
    }

    try {
      setSubmitting(true);
      const pictureUrl = await uploadTeacherPicture(selectedFile, Date.now().toString());
      const newTeacher = await addTeacher(newTeacherName, pictureUrl);
      setTeachers([newTeacher, ...teachers]);
      setNewTeacherName('');
      setSelectedFile(null);
      setShowDialog(false);
      toast.success('Teacher added!');
    } catch (error) {
      console.error('Error adding teacher:', error);
      toast.error('Failed to add teacher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    try {
      await deleteTeacher(id);
      setTeachers(teachers.filter(t => t.id !== id));
      toast.success('Teacher removed');
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast.error('Failed to remove teacher');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Teachers</h2>
        {isAdmin && (
          <Button
            onClick={() => setShowDialog(true)}
            className="neon-button gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Teacher
          </Button>
        )}
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Loading teachers...</p>
          </div>
        ) : teachers.length === 0 ? (
          <div className="col-span-full text-center py-12 rounded-lg" style={{
            background: 'rgba(24, 28, 50, 0.4)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(37, 80, 140, 0.4)',
            border: '1px solid'
          }}>
            <p className="text-muted-foreground">No teachers added yet.</p>
          </div>
        ) : (
          teachers.map(teacher => (
            <div
              key={teacher.id}
              className="rounded-lg overflow-hidden transition-all duration-300"
              style={{
                background: 'rgba(24, 28, 50, 0.4)',
                backdropFilter: 'blur(12px)',
                borderColor: 'rgba(37, 80, 140, 0.4)',
                border: '1px solid'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(24, 28, 50, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.5)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 212, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(24, 28, 50, 0.4)';
                e.currentTarget.style.borderColor = 'rgba(37, 80, 140, 0.4)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={teacher.picture_url}
                  alt={teacher.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-primary mb-3">
                  {teacher.name}
                </h3>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteTeacher(teacher.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Teacher Dialog */}
      {isAdmin && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent style={{
            background: 'rgba(24, 28, 50, 0.8)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(0, 212, 255, 0.5)',
            border: '1px solid'
          }}>
            <DialogHeader>
              <DialogTitle className="text-primary">Add New Teacher</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Teacher Name
                </label>
                <Input
                  placeholder="Enter teacher name"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  className="text-foreground placeholder-muted-foreground"
                  style={{
                    background: 'rgba(24, 28, 50, 0.5)',
                    borderColor: 'rgba(37, 80, 140, 0.5)'
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Teacher Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-foreground"
                  style={{
                    background: 'rgba(24, 28, 50, 0.5)',
                    borderColor: 'rgba(37, 80, 140, 0.5)'
                  }}
                />
                {selectedFile && (
                  <p className="text-xs text-accent mt-2">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDialog(false);
                    setSelectedFile(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddTeacher}
                  disabled={submitting}
                  className="neon-button flex-1"
                >
                  {submitting ? 'Adding...' : 'Add'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
