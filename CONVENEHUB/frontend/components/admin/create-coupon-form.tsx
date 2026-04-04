'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { Save, CalendarIcon, Ticket, Percent, DollarSign } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { MultiSelect, OptionType } from '@/components/ui/multi-select';

// Form validation schema
const couponFormSchema = z.object({
  code: z.string()
    .min(3, 'Coupon code must be at least 3 characters')
    .max(50, 'Coupon code must be less than 50 characters')
    .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase letters, numbers, hyphens, or underscores only'),
  discount_type: z.enum(['percentage', 'fixed', 'free'], {
    required_error: 'Please select a discount type',
  }),
  discount_value: z.coerce.number()
    .min(0, 'Discount value must be positive'),
  event_ids: z.array(z.string()).min(1, 'Please select at least one event'),
  usage_limit: z.coerce.number()
    .int('Must be a whole number')
    .positive('Must be greater than 0')
    .optional()
    .nullable(),
  per_user_limit: z.coerce.number()
    .int('Must be a whole number')
    .positive('Must be greater than 0')
    .default(1),
  min_tickets: z.coerce.number()
    .int('Must be a whole number')
    .min(1, 'Must be at least 1')
    .default(1),
  valid_from: z.date().optional(),
  valid_until: z.date().optional(),
  is_active: z.boolean().default(true),
}).refine((data) => {
  // Validate discount_value based on discount_type
  if (data.discount_type === 'percentage') {
    return data.discount_value > 0 && data.discount_value <= 100;
  }
  if (data.discount_type === 'fixed') {
    return data.discount_value >= 0;
  }
  if (data.discount_type === 'free') {
    return data.discount_value === 100;
  }
  return true;
}, {
  message: 'Invalid discount value for selected type',
  path: ['discount_value'],
}).refine((data) => {
  // Validate date range
  if (data.valid_from && data.valid_until) {
    return data.valid_until > data.valid_from;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['valid_until'],
});

type CouponFormValues = z.infer<typeof couponFormSchema>;

interface Event {
  event_id: string;
  title: string;
  date_time: string;
  status: string;
}

interface CreateCouponFormProps {
  onSuccess?: () => void;
  initialData?: Partial<CouponFormValues & { id: number }>;
  mode?: 'create' | 'edit';
}

export default function CreateCouponForm({ 
  onSuccess, 
  initialData,
  mode = 'create' 
}: CreateCouponFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: initialData ? {
      code: initialData.code || '',
      discount_type: initialData.discount_type || 'percentage',
      discount_value: initialData.discount_value || 0,
      event_ids: initialData.event_ids || [],
      usage_limit: initialData.usage_limit || null,
      per_user_limit: initialData.per_user_limit || 1,
      min_tickets: initialData.min_tickets || 1,
      valid_from: initialData.valid_from ? new Date(initialData.valid_from) : undefined,
      valid_until: initialData.valid_until ? new Date(initialData.valid_until) : undefined,
      is_active: initialData.is_active !== undefined ? initialData.is_active : true,
    } : {
      code: '',
      discount_type: 'percentage',
      discount_value: 10,
      event_ids: [],
      usage_limit: null,
      per_user_limit: 1,
      min_tickets: 1,
      valid_from: undefined,
      valid_until: undefined,
      is_active: true,
    },
  });

  const discountType = form.watch('discount_type');

  // Auto-set discount_value for 'free' type
  useEffect(() => {
    if (discountType === 'free') {
      form.setValue('discount_value', 100);
    }
  }, [discountType, form]);

  // Fetch events
  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/admin/events?status=published,checkin_open,in_progress');
        if (!response.ok) throw new Error('Failed to fetch events');
        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load events',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingEvents(false);
      }
    }
    fetchEvents();
  }, [toast]);

  const onSubmit = async (data: CouponFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        code: data.code.toUpperCase(),
        discountType: data.discount_type,
        discountValue: data.discount_value,
        eventIds: data.event_ids,
        usageLimit: data.usage_limit || null,
        perUserLimit: data.per_user_limit,
        minTickets: data.min_tickets,
        validFrom: data.valid_from?.toISOString() || null,
        validUntil: data.valid_until?.toISOString() || null,
        isActive: data.is_active,
      };

      const url = mode === 'edit' && initialData?.id 
        ? `/api/admin/coupons/${initialData.id}`
        : '/api/admin/coupons';
      
      const method = mode === 'edit' ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save coupon');
      }

      toast({
        title: mode === 'edit' ? 'Coupon Updated' : 'Coupon Created',
        description: `Coupon "${data.code}" has been ${mode === 'edit' ? 'updated' : 'created'} successfully.`,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/coupons');
        router.refresh();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save coupon',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Coupon Code */}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coupon Code *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="WELCOME50" 
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  className="font-mono"
                  disabled={mode === 'edit'}
                />
              </FormControl>
              <FormDescription>
                Unique code customers will enter (uppercase, numbers, hyphens, underscores)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Discount Type */}
        <FormField
          control={form.control}
          name="discount_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="percentage">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Percentage Off
                    </div>
                  </SelectItem>
                  <SelectItem value="fixed">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Fixed Amount Off
                    </div>
                  </SelectItem>
                  <SelectItem value="free">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4" />
                      Free Tickets
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {discountType === 'percentage' && 'Percentage discount (e.g., 20% off)'}
                {discountType === 'fixed' && 'Fixed amount discount (e.g., ₹100 off)'}
                {discountType === 'free' && '100% discount - completely free tickets'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Discount Value */}
        <FormField
          control={form.control}
          name="discount_value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount Value *</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step={discountType === 'percentage' ? '1' : '0.01'}
                  placeholder={discountType === 'percentage' ? '20' : '100'}
                  {...field}
                  disabled={discountType === 'free'}
                />
              </FormControl>
              <FormDescription>
                {discountType === 'percentage' && 'Enter percentage (1-100)'}
                {discountType === 'fixed' && 'Enter amount in ₹'}
                {discountType === 'free' && 'Automatically set to 100 for free tickets'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Event Selection - Multi Select */}
        <FormField
          control={form.control}
          name="event_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Events *</FormLabel>
              <FormControl>
                <MultiSelect
                  options={events.map((event) => ({
                    label: `${event.title} - ${format(new Date(event.date_time), 'MMM dd, yyyy')}`,
                    value: event.event_id,
                  }))}
                  selected={field.value || []}
                  onChange={field.onChange}
                  placeholder={isLoadingEvents ? "Loading events..." : "Select events..."}
                  disabled={isLoadingEvents}
                  className="w-full"
                />
              </FormControl>
              <FormDescription>
                This coupon will work for all selected events. Select multiple events to make it applicable across them.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Usage Limits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="usage_limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Usage Limit</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Unlimited"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
                </FormControl>
                <FormDescription>
                  Max total uses (leave empty for unlimited)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="per_user_limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Per User Limit *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1" {...field} />
                </FormControl>
                <FormDescription>
                  Max uses per user
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="min_tickets"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Tickets *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1" {...field} />
                </FormControl>
                <FormDescription>
                  Minimum tickets required
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Valid From */}
        <FormField
          control={form.control}
          name="valid_from"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Valid From</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a start date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                When the coupon becomes active (optional, defaults to now)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Valid Until */}
        <FormField
          control={form.control}
          name="valid_until"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Valid Until</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick an end date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                When the coupon expires (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Active Status */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <FormDescription>
                  Enable or disable this coupon
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                {mode === 'edit' ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {mode === 'edit' ? 'Update Coupon' : 'Create Coupon'}
              </>
            )}
          </Button>
          {onSuccess && (
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
