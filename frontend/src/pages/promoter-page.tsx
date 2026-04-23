import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@/lib/convene/client';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Link2, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type PublicEvent = {
  event_id: string;
  title: string;
  status: string;
  date_time?: string;
};

type ReferralLink = {
  _id?: string;
  id?: string;
  eventId: string;
  code: string;
  clicks: number;
  conversions: number;
  createdAt?: string;
};

type Commission = {
  _id: string;
  bookingId: string;
  eventId: string;
  referralCode: string;
  amount: number;
  status: 'pending' | 'paid';
  createdAt: string;
};

type Performance = {
  totalBookings: number;
  totalTickets: number;
  totalRevenue: number;
};

type CommissionTotals = {
  total: number;
  paid: number;
  pending: number;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export default function PromoterPage() {
  const supabase = useMemo(() => createClient(), []);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [links, setLinks] = useState<ReferralLink[]>([]);
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [totals, setTotals] = useState<CommissionTotals | null>(null);
  const [creatingLink, setCreatingLink] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async (asRefresh = false) => {
    if (asRefresh) setRefreshing(true);
    try {
      const [eventsRes, linksRes, perfRes, commissionsRes] = await Promise.all([
        fetch('/api/events/public'),
        fetch('/api/promoters/links'),
        fetch('/api/promoters/performance'),
        fetch('/api/promoters/commissions'),
      ]);

      const eventsPayload = await eventsRes.json().catch(() => ({ events: [] }));
      const linksPayload = await linksRes.json().catch(() => ({ links: [] }));
      const perfPayload = await perfRes.json().catch(() => ({ performance: null }));
      const commissionsPayload = await commissionsRes.json().catch(() => ({ commissions: [], totals: null }));

      if (!eventsRes.ok || !linksRes.ok || !perfRes.ok || !commissionsRes.ok) {
        throw new Error('Failed to load promoter dashboard data');
      }

      const publishedEvents: PublicEvent[] = (eventsPayload.events || []).filter(
        (event: PublicEvent) => event.status === 'published' || event.status === 'checkin_open'
      );
      setEvents(publishedEvents);
      if (!selectedEventId && publishedEvents.length > 0) {
        setSelectedEventId(publishedEvents[0].event_id);
      }

      setLinks(linksPayload.links || []);
      setPerformance(perfPayload.performance || null);
      setCommissions(commissionsPayload.commissions || []);
      setTotals(commissionsPayload.totals || null);
    } catch (error) {
      toast({
        title: 'Unable to load dashboard',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate('/login', { replace: true });
        return;
      }

      const role = session.user.role || session.user.user_metadata?.role || 'user';
      if (role !== 'promoter' && role !== 'admin_team') {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      await loadDashboardData(false);
    };

    void run();
  }, [navigate, supabase]);

  const createLink = async () => {
    if (!selectedEventId || creatingLink) return;

    try {
      setCreatingLink(true);
      const response = await fetch('/api/promoters/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: selectedEventId }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.link) {
        throw new Error(payload?.message || 'Failed to create referral link');
      }

      await loadDashboardData(true);
      toast({
        title: 'Referral link ready',
        description: `Code: ${payload.link.code}`,
      });
    } catch (error: any) {
      toast({
        title: 'Could not create link',
        description: error?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCreatingLink(false);
    }
  };

  const copyReferralUrl = async (link: ReferralLink) => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${base}/events/${link.eventId}?ref=${link.code}`;
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      toast({
        title: 'Copy unavailable',
        description: 'Clipboard is not available in this browser context.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Copied',
        description: 'Referral link copied to clipboard.',
      });
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Please copy manually from the table.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-md">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You do not have permission to access the promoter dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Promoter Dashboard</h1>
            <p className="text-slate-600">Create referral links and track your performance.</p>
          </div>
          <Button variant="outline" onClick={() => void loadDashboardData(true)} disabled={refreshing}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Bookings</CardDescription>
              <CardTitle>{performance?.totalBookings ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Tickets</CardDescription>
              <CardTitle>{performance?.totalTickets ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle>{formatMoney(performance?.totalRevenue ?? 0)}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Commission</CardDescription>
              <CardTitle>{formatMoney(totals?.total ?? 0)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Commission</CardDescription>
              <CardTitle>{formatMoney(totals?.pending ?? 0)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Paid Commission</CardDescription>
              <CardTitle>{formatMoney(totals?.paid ?? 0)}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Referral Link</CardTitle>
            <CardDescription>Choose a published event and generate your shareable link.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-3 md:items-center">
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="w-full md:max-w-md">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.event_id} value={event.event_id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={createLink} disabled={!selectedEventId || creatingLink}>
              <Link2 className="w-4 h-4 mr-2" />
              {creatingLink ? 'Generating...' : 'Generate Link'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Referral Links</CardTitle>
            <CardDescription>Clicks and conversions for each generated link.</CardDescription>
          </CardHeader>
          <CardContent>
            {links.length === 0 ? (
              <p className="text-sm text-slate-500">No links yet. Create your first referral link above.</p>
            ) : (
              <div className="space-y-3">
                {links.map((link) => {
                  const event = events.find((item) => item.event_id === link.eventId);
                  const url = `/events/${link.eventId}?ref=${link.code}`;
                  return (
                    <div key={link.id || link._id || link.code} className="p-3 border rounded-lg bg-white">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">{event?.title || 'Event'}</p>
                          <p className="text-sm text-slate-600 break-all">{url}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <Badge variant="secondary">Code: {link.code}</Badge>
                            <Badge variant="outline">Clicks: {link.clicks || 0}</Badge>
                            <Badge variant="outline">Conversions: {link.conversions || 0}</Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => void copyReferralUrl(link)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Commissions</CardTitle>
            <CardDescription>Latest payouts generated from attributed bookings.</CardDescription>
          </CardHeader>
          <CardContent>
            {commissions.length === 0 ? (
              <p className="text-sm text-slate-500">No commissions yet.</p>
            ) : (
              <div className="space-y-2">
                {commissions.slice(0, 10).map((entry) => (
                  <div key={entry._id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="text-sm">
                      <p className="font-medium text-slate-900">{entry.referralCode}</p>
                      <p className="text-slate-500">{new Date(entry.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{formatMoney(entry.amount)}</p>
                      <Badge variant={entry.status === 'paid' ? 'default' : 'secondary'}>{entry.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
