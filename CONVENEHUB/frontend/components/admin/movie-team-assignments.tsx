'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Trash2, UserPlus, Calendar, Users } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { format } from 'date-fns';

interface Assignment {
  assignment_id: string;
  event_id: string;
  user_id: string;
  assigned_at: string;
  user_name: string;
  user_role: string;
  event_title: string;
  event_date: string;
  event_status: string;
}

interface MovieTeamMember {
  id: string;
  full_name: string;
  email: string;
}

interface Event {
  event_id: string;
  title: string;
  date_time: string;
  status: string;
}

export function MovieTeamAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [movieTeamMembers, setMovieTeamMembers] = useState<MovieTeamMember[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch assignments
      const assignmentsRes = await fetch('/api/admin/movie-team-assignments');
      if (!assignmentsRes.ok) throw new Error('Failed to fetch assignments');
      const assignmentsData = await assignmentsRes.json();

      // Fetch movie team members (we'll need to create this endpoint)
      const membersRes = await fetch('/api/admin/movie-team-members');
      if (!membersRes.ok) throw new Error('Failed to fetch team members');
      const membersData = await membersRes.json();

      // Fetch events
      const eventsRes = await fetch('/api/admin/events');
      if (!eventsRes.ok) throw new Error('Failed to fetch events');
      const eventsData = await eventsRes.json();

      setAssignments(assignmentsData.assignments || []);
      setMovieTeamMembers(membersData.members || []);
      setEvents(eventsData.events || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedMember || !selectedEvent) {
      setError('Please select both a team member and an event');
      return;
    }

    try {
      setAssigning(true);
      setError('');

      const response = await fetch('/api/admin/movie-team-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedMember,
          eventId: selectedEvent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign team member');
      }

      setSuccess('Team member assigned successfully!');
      setDialogOpen(false);
      setSelectedMember('');
      setSelectedEvent('');

      // Refresh data
      await fetchData();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to remove this assignment?')) {
      return;
    }

    try {
      setError('');

      const response = await fetch('/api/admin/movie-team-assignments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove assignment');
      }

      setSuccess('Assignment removed successfully!');

      // Refresh data
      await fetchData();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'secondary',
      published: 'default',
      checkin_open: 'default',
      in_progress: 'default',
      ended: 'outline',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading assignments...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Event Operations Assignments</h2>
          <p className="text-muted-foreground">
            Assign event operations members to events they will manage
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Event Operations Member to Event</DialogTitle>
              <DialogDescription>
                Select an event operations member and an event to assign them to
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Operations Member</label>
                <Select value={selectedMember} onValueChange={setSelectedMember}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {movieTeamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.full_name} ({member.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Event</label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.event_id} value={event.event_id}>
                        {event.title} - {format(new Date(event.date_time), 'PPP')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={handleAssign}
                disabled={assigning || !selectedMember || !selectedEvent}
              >
                {assigning ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign Team Member
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Event Operations Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movieTeamMembers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.filter(e => e.status !== 'ended').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Assignments</CardTitle>
          <CardDescription>
            View and manage event operations assignments to events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No assignments yet. Click "Assign Team Member" to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Member</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Event Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.assignment_id}>
                    <TableCell className="font-medium">
                      {assignment.user_name}
                    </TableCell>
                    <TableCell>{assignment.event_title}</TableCell>
                    <TableCell>
                      {format(new Date(assignment.event_date), 'PPP')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(assignment.event_status)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(assignment.assigned_at), 'PPP')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(assignment.assignment_id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
