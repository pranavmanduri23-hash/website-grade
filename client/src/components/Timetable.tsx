import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface TimeSlot {
  id: string;
  day: string;
  period: number;
  subject: string;
  teacher: string;
  time: string;
  isEnrichment?: boolean;
}

interface TimetableProps {
  isAdmin: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
const ENRICHMENT_PERIODS = [1, 2];
const TIMES = [
  '8:00 - 8:45',
  '8:45 - 9:30',
  '9:45 - 10:30',
  '10:30 - 11:15',
  '11:30 - 12:15',
  '1:00 - 1:45',
  '1:45 - 2:30',
  '2:30 - 3:15'
];
const ENRICHMENT_TIMES = [
  '3:15 - 4:00',
  '4:00 - 4:45'
];

export default function Timetable({ isAdmin }: TimetableProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedPeriod, setSelectedPeriod] = useState('1');
  const [isEnrichment, setIsEnrichment] = useState(false);
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('timetable')
        .select('*');
      
      if (error) throw error;
      setSlots(data || []);
    } catch (error: any) {
      console.error('Error fetching timetable:', error);
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSlot = async () => {
    if (!subject.trim() || !teacher.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const period = parseInt(selectedPeriod);
    const time = isEnrichment ? ENRICHMENT_TIMES[period - 1] : TIMES[period - 1];

    try {
      if (editingSlot) {
        const { error } = await supabase
          .from('timetable')
          .update({
            day: selectedDay,
            period,
            subject,
            teacher,
            time,
            is_enrichment: isEnrichment
          })
          .eq('id', editingSlot.id);

        if (error) throw error;
        toast.success('Slot updated!');
      } else {
        const { error } = await supabase
          .from('timetable')
          .insert([{
            day: selectedDay,
            period,
            subject,
            teacher,
            time,
            is_enrichment: isEnrichment
          }]);

        if (error) throw error;
        toast.success('Slot added!');
      }
      fetchSlots();
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save slot');
    }
  };

  const resetForm = () => {
    setShowDialog(false);
    setEditingSlot(null);
    setSelectedDay('Monday');
    setSelectedPeriod('1');
    setSubject('');
    setTeacher('');
    setIsEnrichment(false);
  };

  const handleEditSlot = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setSelectedDay(slot.day);
    setSelectedPeriod(slot.period.toString());
    setSubject(slot.subject);
    setTeacher(slot.teacher);
    setIsEnrichment(slot.isEnrichment || false);
    setShowDialog(true);
  };

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;
    
    try {
      const { error } = await supabase
        .from('timetable')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSlots(slots.filter(s => s.id !== id));
      toast.success('Slot deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete slot');
    }
  };

  const getSlotForDayPeriod = (day: string, period: number, isEnrichmentClass: boolean) => {
    return slots.find(s => s.day === day && s.period === period && (s.isEnrichment || (s as any).is_enrichment || false) === isEnrichmentClass);
  };

  if (loading) {
    return <div className="text-center py-10">Loading timetable...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Weekly Timetable</h2>
        {isAdmin && (
          <Button
            onClick={() => {
              resetForm();
              setShowDialog(true);
            }}
            className="neon-button gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Slot
          </Button>
        )}
      </div>

      {/* Regular Classes Timetable */}
      <div>
        <h3 className="text-lg font-semibold text-primary mb-3">Regular Classes (8 Periods)</h3>
        <div className="overflow-x-auto">
          <div className="rounded-lg" style={{
            background: 'rgba(24, 28, 50, 0.4)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(37, 80, 140, 0.4)',
            border: '1px solid'
          }}>
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(37, 80, 140, 0.4)' }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-primary">Period</th>
                  {DAYS.map(day => (
                    <th key={day} className="px-4 py-3 text-left text-sm font-semibold text-primary">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map(period => (
                  <tr key={period} className="border-b" style={{ borderColor: 'rgba(37, 80, 140, 0.2)' }}>
                    <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                      <div>{period}</div>
                      <div className="text-xs">{TIMES[period - 1]}</div>
                    </td>
                    {DAYS.map(day => {
                      const slot = getSlotForDayPeriod(day, period, false);
                      return (
                        <td key={`${day}-${period}`} className="px-4 py-3">
                          {slot ? (
                            <div className="p-2 rounded" style={{
                              background: 'rgba(0, 212, 255, 0.1)',
                              borderColor: 'rgba(0, 212, 255, 0.3)',
                              border: '1px solid'
                            }}>
                              <div className="font-semibold text-primary text-sm">{slot.subject}</div>
                              <div className="text-xs text-muted-foreground">{slot.teacher}</div>
                              {isAdmin && (
                                <div className="flex gap-1 mt-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-primary"
                                    onClick={() => handleEditSlot(slot)}
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDeleteSlot(slot.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground text-center py-4">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Enrichment Classes */}
      <div>
        <h3 className="text-lg font-semibold text-accent mb-3">✨ Enrichment Classes (After School)</h3>
        <div className="overflow-x-auto">
          <div className="rounded-lg" style={{
            background: 'rgba(24, 28, 50, 0.4)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(255, 0, 255, 0.4)',
            border: '1px solid'
          }}>
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(255, 0, 255, 0.4)' }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-accent">Period</th>
                  {DAYS.map(day => (
                    <th key={day} className="px-4 py-3 text-left text-sm font-semibold text-accent">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ENRICHMENT_PERIODS.map(period => (
                  <tr key={`enrich-${period}`} className="border-b" style={{ borderColor: 'rgba(255, 0, 255, 0.2)' }}>
                    <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                      <div>E{period}</div>
                      <div className="text-xs">{ENRICHMENT_TIMES[period - 1]}</div>
                    </td>
                    {DAYS.map(day => {
                      const slot = getSlotForDayPeriod(day, period, true);
                      return (
                        <td key={`${day}-enrich-${period}`} className="px-4 py-3">
                          {slot ? (
                            <div className="p-2 rounded" style={{
                              background: 'rgba(255, 0, 255, 0.1)',
                              borderColor: 'rgba(255, 0, 255, 0.3)',
                              border: '1px solid'
                            }}>
                              <div className="font-semibold text-accent text-sm">{slot.subject}</div>
                              <div className="text-xs text-muted-foreground">{slot.teacher}</div>
                              {isAdmin && (
                                <div className="flex gap-1 mt-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-accent"
                                    onClick={() => handleEditSlot(slot)}
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDeleteSlot(slot.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground text-center py-4">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {isAdmin && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent style={{
            background: 'rgba(24, 28, 50, 0.8)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(0, 212, 255, 0.5)',
            border: '1px solid'
          }}>
            <DialogHeader>
              <DialogTitle className="text-primary">
                {editingSlot ? 'Edit Time Slot' : 'Add Time Slot'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enrichment"
                  checked={isEnrichment}
                  onChange={(e) => setIsEnrichment(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="enrichment" className="text-sm font-medium text-foreground">
                  Enrichment Class
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Day</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full px-3 py-2 rounded text-foreground"
                    style={{
                      background: 'rgba(24, 28, 50, 0.5)',
                      borderColor: 'rgba(37, 80, 140, 0.5)',
                      border: '1px solid'
                    }}
                  >
                    {DAYS.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Period</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-3 py-2 rounded text-foreground"
                    style={{
                      background: 'rgba(24, 28, 50, 0.5)',
                      borderColor: 'rgba(37, 80, 140, 0.5)',
                      border: '1px solid'
                    }}
                  >
                    {(isEnrichment ? ENRICHMENT_PERIODS : PERIODS).map(p => {
                      const timeArray = isEnrichment ? ENRICHMENT_TIMES : TIMES;
                      return (
                        <option key={p} value={p}>
                          {isEnrichment ? `E${p}` : p} ({timeArray[p - 1]})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Subject</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Mathematics"
                  className="bg-slate-900/50 border-slate-700"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Teacher</label>
                <Input
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  placeholder="e.g. Mr. Smith"
                  className="bg-slate-900/50 border-slate-700"
                />
              </div>
              <Button onClick={handleSaveSlot} className="w-full neon-button">
                {editingSlot ? 'Update Slot' : 'Add Slot'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
