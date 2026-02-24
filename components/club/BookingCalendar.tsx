'use client';

import { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BookingCalendarProps {
  groupId: string;
  isAdmin?: boolean;
}

interface ScheduleEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  aircraftId?: string;
  aircraft?: {
    nNumber: string;
    name: string;
  };
  user?: {
    id: string;
    name: string;
  };
  type: 'booking' | 'blockout';
}

interface Aircraft {
  id: string;
  nNumber: string;
  customName: string;
  nickname: string;
  make: string;
  model: string;
  status: string;
}

export default function BookingCalendar({ groupId, isAdmin = false }: BookingCalendarProps) {
  const calendarRef = useRef<any>(null);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [formData, setFormData] = useState({
    aircraftId: '',
    purpose: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    fetchSchedule();
  }, [groupId]);

  const fetchSchedule = async () => {
    try {
      const res = await fetch(`/api/clubs/${groupId}/schedule`);
      if (res.ok) {
        const data = await res.json();
        setEvents([...data.bookings, ...data.blockouts]);
        setAircraft(data.aircraft || []);
      }
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    setSelectedEvent(null);
    setFormData({
      aircraftId: '',
      purpose: '',
      startTime: formatDateTimeLocal(selectInfo.startStr),
      endTime: formatDateTimeLocal(selectInfo.endStr),
    });
    setShowModal(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const event = events.find(e => e.id === clickInfo.event.id);
    if (event) {
      setSelectedEvent(event);
      setFormData({
        aircraftId: event.aircraftId || '',
        purpose: event.title,
        startTime: formatDateTimeLocal(event.start),
        endTime: formatDateTimeLocal(event.end),
      });
      setShowModal(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`/api/clubs/${groupId}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aircraftId: formData.aircraftId,
          purpose: formData.purpose,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
        }),
      });

      if (res.ok) {
        setShowModal(false);
        fetchSchedule();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create booking');
      }
    } catch (err) {
      console.error('Failed to create booking:', err);
      alert('Failed to create booking');
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent || selectedEvent.type !== 'booking') return;
    
    if (!confirm('Delete this booking?')) return;

    try {
      const res = await fetch(`/api/clubs/${groupId}/bookings?bookingId=${selectedEvent.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setShowModal(false);
        fetchSchedule();
      }
    } catch (err) {
      console.error('Failed to delete booking:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading schedule...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        events={events.map(e => ({
          id: e.id,
          title: e.title,
          start: e.start,
          end: e.end,
          backgroundColor: e.type === 'blockout' ? '#ef4444' : '#3b82f6',
          borderColor: e.type === 'blockout' ? '#ef4444' : '#3b82f6',
        }))}
        select={handleDateSelect}
        eventClick={handleEventClick}
        height="auto"
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        weekends={true}
      />

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? 'View Booking' : 'New Booking'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="aircraft">Aircraft</Label>
              <Select
                value={formData.aircraftId}
                onValueChange={(v) => setFormData({ ...formData, aircraftId: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select aircraft" />
                </SelectTrigger>
                <SelectContent>
                  {aircraft.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nNumber} - {a.customName || a.nickname || `${a.make} ${a.model}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="Training flight"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">End</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex justify-between">
              {selectedEvent?.type === 'booking' && (
                <Button type="button" variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedEvent ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatDateTimeLocal(isoString: string): string {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}
