import { useState, useEffect } from 'react';
import { Trophy, Medal, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getStudents, addStudent, deleteStudent, type Student } from '@/lib/supabase';

interface LeaderboardProps {
  isAdmin: boolean;
}

export default function Leaderboard({ isAdmin }: LeaderboardProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudentName.trim()) {
      toast.error('Please enter a student name');
      return;
    }

    try {
      setSubmitting(true);
      const newStudent = await addStudent(newStudentName);
      setStudents([newStudent, ...students]);
      setNewStudentName('');
      setShowDialog(false);
      toast.success('Student added!');
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await deleteStudent(id);
      setStudents(students.filter(s => s.id !== id));
      toast.success('Student removed');
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to remove student');
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-400" />;
    return <span className="text-sm font-bold text-primary">#{rank}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Class Students</h2>
        {isAdmin && (
          <Button
            onClick={() => setShowDialog(true)}
            className="neon-button gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </Button>
        )}
      </div>

      {/* Students List */}
      <div className="overflow-x-auto rounded-lg" style={{
        background: 'rgba(24, 28, 50, 0.4)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(37, 80, 140, 0.4)',
        border: '1px solid'
      }}>
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No students added yet.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(37, 80, 140, 0.4)' }}>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Rank</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Name</th>
                {isAdmin && (
                  <th className="px-4 py-3 text-center text-sm font-semibold text-primary">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr
                  key={student.id}
                  className="border-b transition-colors duration-300"
                  style={{ borderColor: 'rgba(37, 80, 140, 0.2)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center">
                      {getRankIcon(index + 1)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-foreground">{student.name}</div>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteStudent(student.id)}
                        title="Remove student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="p-4 rounded-lg" style={{
          background: 'rgba(24, 28, 50, 0.4)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(37, 80, 140, 0.4)',
          border: '1px solid'
        }}>
          <div className="text-sm text-muted-foreground mb-1">Total Students</div>
          <div className="text-2xl font-bold text-primary">{students.length}</div>
          <div className="text-xs text-accent mt-2">in your class</div>
        </div>

        <div className="p-4 rounded-lg" style={{
          background: 'rgba(24, 28, 50, 0.4)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(37, 80, 140, 0.4)',
          border: '1px solid'
        }}>
          <div className="text-sm text-muted-foreground mb-1">Class Status</div>
          <div className="text-2xl font-bold text-primary">
            {students.length === 0 ? 'Empty' : 'Active'}
          </div>
          <div className="text-xs text-accent mt-2">
            {students.length === 0 ? 'Add your first student' : 'Ready to go!'}
          </div>
        </div>
      </div>

      {/* Add Student Dialog */}
      {isAdmin && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent style={{
            background: 'rgba(24, 28, 50, 0.8)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(0, 212, 255, 0.5)',
            border: '1px solid'
          }}>
            <DialogHeader>
              <DialogTitle className="text-primary">Add New Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Student Name
                </label>
                <Input
                  placeholder="Enter student name"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="text-foreground placeholder-muted-foreground"
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
                  onClick={handleAddStudent}
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
