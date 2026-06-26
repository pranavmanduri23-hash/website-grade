import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { getAssignments, addAssignment, deleteAssignment, type Assignment } from '@/lib/supabase';

interface AnnouncementBoardProps {
  isAdmin: boolean;
}

export default function AnnouncementBoard({ isAdmin }: AnnouncementBoardProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load assignments on mount
  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await getAssignments();
      setAssignments(data);
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssignment = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      const newAssignment = await addAssignment(newTitle, newContent);
      setAssignments([newAssignment, ...assignments]);
      setNewTitle('');
      setNewContent('');
      setShowDialog(false);
      toast.success('Assignment posted!');
    } catch (error) {
      console.error('Error adding assignment:', error);
      toast.error('Failed to post assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      await deleteAssignment(id);
      setAssignments(assignments.filter(a => a.id !== id));
      toast.success('Assignment deleted');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Assignments</h2>
        {isAdmin && (
          <Button
            onClick={() => setShowDialog(true)}
            className="neon-button gap-2"
          >
            <Plus className="w-4 h-4" />
            Post Assignment
          </Button>
        )}
      </div>

      {/* Assignments List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 rounded-lg" style={{
            background: 'rgba(24, 28, 50, 0.4)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(37, 80, 140, 0.4)',
            border: '1px solid'
          }}>
            <p className="text-muted-foreground">Loading assignments...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12 rounded-lg" style={{
            background: 'rgba(24, 28, 50, 0.4)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(37, 80, 140, 0.4)',
            border: '1px solid'
          }}>
            <p className="text-muted-foreground">No assignments yet. Check back soon!</p>
          </div>
        ) : (
          assignments.map(assignment => (
            <div
              key={assignment.id}
              className="p-4 rounded-lg transition-all duration-300"
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
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary mb-1">
                    {assignment.title}
                  </h3>
                  <p className="text-foreground mb-2">
                    {assignment.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(assignment.created_at)}
                  </p>
                </div>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteAssignment(assignment.id)}
                    title="Delete assignment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Assignment Dialog */}
      {isAdmin && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent style={{
            background: 'rgba(24, 28, 50, 0.8)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(0, 212, 255, 0.5)',
            border: '1px solid'
          }}>
            <DialogHeader>
              <DialogTitle className="text-primary">Post New Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Title
                </label>
                <Input
                  placeholder="Assignment title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="text-foreground placeholder-muted-foreground"
                  style={{
                    background: 'rgba(24, 28, 50, 0.5)',
                    borderColor: 'rgba(37, 80, 140, 0.5)'
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Description
                </label>
                <Textarea
                  placeholder="Assignment description"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="text-foreground placeholder-muted-foreground min-h-24"
                  style={{
                    background: 'rgba(24, 28, 50, 0.5)',
                    borderColor: 'rgba(37, 80, 140, 0.5)'
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddAssignment}
                  disabled={submitting}
                  className="neon-button flex-1"
                >
                  {submitting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
