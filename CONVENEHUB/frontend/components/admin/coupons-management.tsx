'use client';

import { useState, useEffect } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Ticket,
  Percent,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  RefreshCcw,
  Power,
  PowerOff
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { format } from 'date-fns';
import CreateCouponForm from './create-coupon-form';
import { Switch } from '@/components/ui/switch';

interface Coupon {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed' | 'free';
  discount_value: number;
  event_id: string;
  usage_limit: number | null;
  per_user_limit: number;
  min_tickets: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  current_usage_count: number;
  created_at: string;
  events?: {
    title: string;
    date_time: string;
  };
  coupon_events?: Array<{
    event_id: string;
    events: {
      event_id: string;
      title: string;
    };
  }>;
}

export default function CouponsManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/coupons');
      if (!response.ok) throw new Error('Failed to fetch coupons');
      const data = await response.json();
      setCoupons(data.coupons || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load coupons',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggleActive = async (couponId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update coupon');

      toast({
        title: 'Success',
        description: `Coupon ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });

      fetchCoupons();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update coupon status',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!couponToDelete) return;

    try {
      const response = await fetch(`/api/admin/coupons/${couponToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete coupon');

      toast({
        title: 'Success',
        description: 'Coupon deleted successfully',
      });

      fetchCoupons();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete coupon',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setCouponToDelete(null);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsEditDialogOpen(true);
  };

  const getDiscountDisplay = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return (
        <div className="flex items-center gap-1">
          <Percent className="h-3 w-3" />
          {coupon.discount_value}%
        </div>
      );
    }
    if (coupon.discount_type === 'fixed') {
      return (
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          ₹{coupon.discount_value}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1">
        <Ticket className="h-3 w-3" />
        FREE
      </div>
    );
  };

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date();
    
    if (!coupon.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return <Badge variant="outline">Scheduled</Badge>;
    }
    
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    if (coupon.usage_limit && coupon.current_usage_count >= coupon.usage_limit) {
      return <Badge variant="destructive">Limit Reached</Badge>;
    }
    
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <div className="w-full py-4 sm:py-8 px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">Coupon Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create and manage discount coupons for your events
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={fetchCoupons} size="sm" className="flex-1 sm:flex-none">
            <RefreshCcw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex-1 sm:flex-none">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Create Coupon</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Coupon</DialogTitle>
                <DialogDescription>
                  Add a new discount coupon for your events
                </DialogDescription>
              </DialogHeader>
              <CreateCouponForm
                onSuccess={() => {
                  setIsCreateDialogOpen(false);
                  fetchCoupons();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-3 sm:p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Coupons</p>
              <p className="text-xl sm:text-2xl font-bold">{coupons.length}</p>
            </div>
            <Ticket className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Active Coupons</p>
              <p className="text-xl sm:text-2xl font-bold">
                {coupons.filter(c => c.is_active).length}
              </p>
            </div>
            <Power className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Uses</p>
              <p className="text-xl sm:text-2xl font-bold">
                {coupons.reduce((sum, c) => sum + c.current_usage_count, 0)}
              </p>
            </div>
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Avg Usage</p>
              <p className="text-xl sm:text-2xl font-bold">
                {coupons.length > 0 
                  ? Math.round(coupons.reduce((sum, c) => sum + c.current_usage_count, 0) / coupons.length)
                  : 0}
              </p>
            </div>
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No coupons yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first coupon to start offering discounts
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Coupon
          </Button>
        </div>
      ) : (
        <>
          {/* Mobile View (Cards) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="text-lg font-mono font-bold bg-gray-100 px-2 py-1 rounded text-primary">
                        {coupon.code}
                      </code>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {coupon.coupon_events && coupon.coupon_events.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {coupon.coupon_events.slice(0, 2).map((ce, idx) => (
                            <span key={idx} className="truncate max-w-[200px]">
                              {ce.events?.title}
                            </span>
                          ))}
                          {coupon.coupon_events.length > 2 && (
                            <span className="text-xs">+{coupon.coupon_events.length - 2} more</span>
                          )}
                        </div>
                      ) : (
                        "All Events"
                      )}
                    </div>
                  </div>
                  {getStatusBadge(coupon)}
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-dashed">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Discount</p>
                    <div className="font-medium">{getDiscountDisplay(coupon)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Usage</p>
                    <div className="font-medium">
                      {coupon.current_usage_count}
                      {coupon.usage_limit && <span className="text-muted-foreground"> / {coupon.usage_limit}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">
                      {coupon.valid_from ? format(new Date(coupon.valid_from), 'MMM dd') : 'Anytime'} 
                      {' - '}
                      {coupon.valid_until ? format(new Date(coupon.valid_until), 'MMM dd') : 'Forever'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={coupon.is_active}
                      onCheckedChange={() => handleToggleActive(coupon.id, coupon.is_active)}
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(coupon)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" 
                      onClick={() => {
                        setCouponToDelete(coupon.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden md:block bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <code className="font-mono font-semibold bg-gray-100 px-2 py-1 rounded">
                        {coupon.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div>
                        {coupon.coupon_events && coupon.coupon_events.length > 0 ? (
                          <div className="space-y-1">
                            {coupon.coupon_events.map((ce, idx) => (
                              <p key={idx} className="text-sm font-medium">
                                {ce.events?.title || 'Unknown Event'}
                              </p>
                            ))}
                            {coupon.coupon_events.length > 1 && (
                              <Badge variant="secondary" className="text-xs">
                                {coupon.coupon_events.length} events
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No events</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getDiscountDisplay(coupon)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {coupon.current_usage_count}
                          {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {coupon.per_user_limit} per user
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        {coupon.valid_from && (
                          <div>From: {format(new Date(coupon.valid_from), 'MMM dd')}</div>
                        )}
                        {coupon.valid_until && (
                          <div>Until: {format(new Date(coupon.valid_until), 'MMM dd')}</div>
                        )}
                        {!coupon.valid_from && !coupon.valid_until && (
                          <span className="text-muted-foreground">No limits</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(coupon)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={coupon.is_active}
                        onCheckedChange={() => handleToggleActive(coupon.id, coupon.is_active)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(coupon)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(coupon.id, coupon.is_active)}
                          >
                            {coupon.is_active ? (
                              <>
                                <PowerOff className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setCouponToDelete(coupon.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </div>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>
              Update coupon details
            </DialogDescription>
          </DialogHeader>
          {selectedCoupon && (
            <CreateCouponForm
              mode="edit"
              initialData={{
                ...selectedCoupon,
                event_ids: selectedCoupon.coupon_events?.map(ce => ce.event_id) || 
                           (selectedCoupon.event_id ? [selectedCoupon.event_id] : []),
                valid_from: selectedCoupon.valid_from ? new Date(selectedCoupon.valid_from) : undefined,
                valid_until: selectedCoupon.valid_until ? new Date(selectedCoupon.valid_until) : undefined,
              }}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setSelectedCoupon(null);
                fetchCoupons();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the coupon.
              {coupons.find(c => c.id === couponToDelete)?.current_usage_count ? (
                <span className="block mt-2 font-semibold text-orange-600">
                  Warning: This coupon has been used{' '}
                  {coupons.find(c => c.id === couponToDelete)?.current_usage_count} time(s).
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
