"use client";
import React from "react";

function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/convene/client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Send, CalendarIcon, Clock, Upload, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { validateImageFile, generateSecureFilename } from "@/lib/validation/file";
import { extractUploadPath, resolveAssetUrl } from "@/lib/storage";

// Form validation schema
const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  venue_name: z.string().min(3, "Venue name is required"),
  venue_address: z.string().min(5, "Venue address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  date_time: z.string().min(1, "Date and time are required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  ticket_price: z.coerce.number().min(0, "Price must be 0 or greater"),
  vip_ticket_price: z.preprocess(value => value === "" || value === null || value === undefined ? undefined : Number(value), z.number().min(0, "VIP price must be 0 or greater").optional()),
  platform_commission_percentage: z.coerce.number().min(0, "Commission must be 0 or greater").max(100, "Commission cannot exceed 100%"),
  event_image: z.string().optional(),
  entry_instructions: z.string().optional(),
  terms: z.string().optional(),
  status: z.enum(["draft", "published", "checkin_open", "in_progress", "ended"])
}).refine(data => data.vip_ticket_price === undefined || data.ticket_price !== data.vip_ticket_price, {
  message: "General and VIP prices must be different",
  path: ["vip_ticket_price"]
});
export default function CreateEventForm({
  userId,
  actorRole = "admin_team",
  successRedirectPath = "/admin?tab=events"
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const {
    toast
  } = useToast();
  const client = createClient();
  const form = useForm({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      venue_name: "",
      venue_address: "",
      city: "",
      latitude: "",
      longitude: "",
      date_time: "",
      capacity: 50,
      ticket_price: 0,
      vip_ticket_price: undefined,
      platform_commission_percentage: 10,
      event_image: "",
      entry_instructions: "",
      terms: "",
      status: "draft"
    }
  });
  const onSubmit = async data => {
    setIsSubmitting(true);
    try {
      // Create event in database
      const {
        data: event,
        error
      } = await client.from("events").insert({
        title: data.title,
        description: data.description,
        venue_name: data.venue_name,
        venue_address: data.venue_address,
        city: data.city,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        date_time: new Date(data.date_time).toISOString(),
        capacity: data.capacity,
        remaining: data.capacity,
        // Initialize remaining with capacity
        ticket_price: data.ticket_price,
        ...(data.vip_ticket_price !== undefined ? {
          vip_ticket_price: data.vip_ticket_price
        } : {}),
        platform_commission_percentage: data.platform_commission_percentage,
        event_image: data.event_image || null,
        entry_instructions: data.entry_instructions || null,
        terms: data.terms || null,
        status: data.status,
        created_by: userId
      }).select().single();
      if (error) {
        throw error;
      }

      // Log the action in audit logs
      await client.from("audit_logs").insert({
        actor_id: userId,
        actor_role: actorRole,
        action: "CREATE_EVENT",
        entity: "events",
        entity_id: event?.event_id
      });
      toast({
        title: "Success!",
        description: `Event "${data.title}" has been created with status: ${data.status}.`
      });

      // Reset form
      form.reset();

      // Redirect to the configured destination after successful creation
      router.push(successRedirectPath);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleImageUpload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Comprehensive validation using validation utility
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: "Invalid file",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }
    setIsUploading(true);
    try {
      // Delete old image from storage if user is replacing an image
      const currentImage = form.getValues("event_image");
      if (currentImage) {
        try {
          const filePath = extractUploadPath(currentImage);
          if (filePath) {
            await client.storage.from("events").remove([filePath]);
          }
        } catch (urlError) {}
      }

      // Generate secure filename with validated extension
      const fileName = generateSecureFilename(file.name);
      const filePath = `events/${fileName}`;

      // Upload to Supabase Storage
      const {
        data,
        error
      } = await client.storage.from("events").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false
      });
      if (error) {
        throw error;
      }

      // Update form field
      form.setValue("event_image", data?.publicUrl || resolveAssetUrl(data?.path || filePath));
      toast({
        title: "Image uploaded!",
        description: "Event image has been uploaded successfully."
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  return React.createElement(Form, form, React.createElement("form", {
    onSubmit: form.handleSubmit(onSubmit),
    className: "space-y-8"
  }, React.createElement("div", {
    className: "space-y-4"
  }, React.createElement("div", {
    className: "pb-3 border-b border-gray-200"
  }, React.createElement("h3", {
    className: "text-lg font-semibold text-gray-900"
  }, "Basic Information"), React.createElement("p", {
    className: "text-sm text-gray-500 mt-1"
  }, "Essential details about your event")), React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-6"
  }, React.createElement(FormField, {
    control: form.control,
    name: "title",
    render: ({
      field
    }) => React.createElement(FormItem, null, React.createElement(FormLabel, {
      className: "text-gray-700 font-medium"
    }, "Event Title *"), React.createElement(FormControl, null, React.createElement(Input, _extends({
      placeholder: "e.g., TechFest 2026 - Main Stage",
      className: "border-gray-300 focus:border-[#195ADC] focus:ring-[#195ADC]"
    }, field))), React.createElement(FormMessage, null))
  }), React.createElement(FormField, {
    control: form.control,
    name: "city",
    render: ({
      field
    }) => React.createElement(FormItem, null, React.createElement(FormLabel, {
      className: "text-gray-700 font-medium"
    }, "City *"), React.createElement(FormControl, null, React.createElement(Input, _extends({
      placeholder: "e.g., Mumbai, Hyderabad, Bangalore",
      className: "border-gray-300 focus:border-[#195ADC] focus:ring-[#195ADC]"
    }, field, {
      onChange: e => {
        // Capitalize first letter of each word
        const formatted = e.target.value.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
        field.onChange(formatted);
      }
    }))), React.createElement(FormMessage, null))
  })), React.createElement(FormField, {
    control: form.control,
    name: "description",
    render: ({
      field
    }) => React.createElement(FormItem, null, React.createElement(FormLabel, {
      className: "text-gray-700 font-medium"
    }, "Description *"), React.createElement(FormControl, null, React.createElement(Textarea, _extends({
      placeholder: "Describe the event, what attendees can expect...",
      className: "min-h-[120px] border-gray-300 focus:border-[#195ADC] focus:ring-[#195ADC] resize-none"
    }, field))), React.createElement(FormMessage, null))
  })), React.createElement("div", {
    className: "space-y-4"
  }, React.createElement("div", {
    className: "pb-3 border-b border-gray-200"
  }, React.createElement("h3", {
    className: "text-lg font-semibold text-gray-900"
  }, "Venue Details"), React.createElement("p", {
    className: "text-sm text-gray-500 mt-1"
  }, "Location information for the event")), React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-6"
  }, React.createElement(FormField, {
    control: form.control,
    name: "venue_name",
    render: ({
      field
    }) => React.createElement(FormItem, null, React.createElement(FormLabel, {
      className: "text-gray-700 font-medium"
    }, "Venue Name *"), React.createElement(FormControl, null, React.createElement(Input, _extends({
      placeholder: "e.g., Film City Studio 5",
      className: "border-gray-300 focus:border-[#195ADC] focus:ring-[#195ADC]"
    }, field))), React.createElement(FormMessage, null))
  }), React.createElement(FormField, {
    control: form.control,
    name: "venue_address",
    render: ({
      field
    }) => React.createElement(FormItem, null, React.createElement(FormLabel, {
      className: "text-gray-700 font-medium"
    }, "Venue Address *"), React.createElement(FormControl, null, React.createElement(Input, _extends({
      placeholder: "Complete venue address",
      className: "border-gray-300 focus:border-[#195ADC] focus:ring-[#195ADC]"
    }, field))), React.createElement(FormMessage, null))
  })), React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-6"
  }, React.createElement(FormField, {
    control: form.control,
    name: "latitude",
    render: ({
      field
    }) => React.createElement(FormItem, null, React.createElement(FormLabel, {
      className: "text-gray-700 font-medium"
    }, "Latitude (Optional)"), React.createElement(FormControl, null, React.createElement(Input, _extends({
      type: "number",
      step: "any",
      placeholder: "e.g., 19.076090",
      className: "border-gray-300 focus:border-[#195ADC] focus:ring-[#195ADC]"
    }, field))), React.createElement(FormDescription, {
      className: "text-xs text-gray-500"
    }, "GPS latitude for map display"), React.createElement(FormMessage, null))
  }), React.createElement(FormField, {
    control: form.control,
    name: "longitude",
    render: ({
      field
    }) => React.createElement(FormItem, null, React.createElement(FormLabel, {
      className: "text-gray-700 font-medium"
    }, "Longitude (Optional)"), React.createElement(FormControl, null, React.createElement(Input, _extends({
      type: "number",
      step: "any",
      placeholder: "e.g., 72.877426",
      className: "border-gray-300 focus:border-[#195ADC] focus:ring-[#195ADC]"
    }, field))), React.createElement(FormDescription, {
      className: "text-xs text-gray-500"
    }, "GPS longitude for map display"), React.createElement(FormMessage, null))
  })), React.createElement(FormField, {
    control: form.control,
    name: "event_image",
    render: ({
      field
    }) => React.createElement(FormItem, null, React.createElement(FormLabel, {
      className: "text-gray-700 font-medium"
    }, "Event Image (Optional)"), React.createElement("div", {
      className: "space-y-3"
    }, field.value && React.createElement("div", {
      className: "relative w-full h-48 border-2 border-gray-200 rounded-lg overflow-hidden"
    }, React.createElement("img", {
      src: resolveAssetUrl(field.value),
      alt: "Event preview",
      className: "w-full h-full object-cover"
    }), React.createElement(Button, {
      type: "button",
      variant: "destructive",
      size: "sm",
      className: "absolute top-2 right-2",
      onClick: () => form.setValue("event_image", "")
    }, React.createElement(X, {
      className: "h-4 w-4"
    }))), React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement("div", {
      className: "relative flex-1"
    }, React.createElement(Input, _extends({
      type: "text",
      inputMode: "url",
      autoComplete: "off",
      placeholder: "Paste an image URL or use the uploaded poster...",
      className: "border-gray-300 focus:border-[#195ADC] focus:ring-[#195ADC]"
    }, field))), React.createElement("div", {
      className: "relative"
    }, React.createElement("input", {
      type: "file",
      accept: "image/*",
      onChange: handleImageUpload,
      className: "hidden",
      id: "image-upload",
      disabled: isUploading
    }), React.createElement(Button, {
      type: "button",
      variant: "outline",
      onClick: () => document.getElementById("image-upload")?.click(),
      disabled: isUploading,
      className: "whitespace-nowrap"
    }, isUploading ? React.createElement(React.Fragment, null, React.createElement(Spinner, {
      className: "mr-2 h-4 w-4 text-[#195ADC]"
    }), "Uploading...") : React.createElement(React.Fragment, null, React.createElement(Upload, {
      className: "mr-2 h-4 w-4"
    }), "Upload"))))), React.createElement(FormDescription, {
      className: "text-xs text-gray-500"
    }, "Upload an image or paste URL to the event poster (max 5MB)"), React.createElement(FormMessage, null))
  })), React.createElement("div", {
    className: "space-y-4"
  }, React.createElement("div", {
    className: "pb-3 border-b border-gray-200"
  }, React.createElement("h3", {
    className: "text-lg font-semibold text-gray-900"
  }, "Event Details"), React.createElement("p", {
    className: "text-sm text-gray-500 mt-1"
  }, "Schedule and capacity information")), React.createElement("div", {
    className: "space-y-6"
  }, React.createElement(FormField, {
    control: form.control,
    name: "date_time",
    render: ({
      field
    }) => {
      const dateValue = field.value ? new Date(field.value) : undefined;
      return React.createElement(FormItem, {
        className: "flex flex-col"
      }, React.createElement(FormLabel, {
        className: "text-gray-700 font-medium"
      }, "Date & Time *"), React.createElement("div", {
        className: "grid grid-cols-1 md:grid-cols-2 gap-4"
      }, React.createElement(Popover, null, React.createElement(PopoverTrigger, {
        asChild: true
      }, React.createElement(FormControl, null, React.createElement(Button, {
        variant: "outline",
        className: cn("w-full pl-3 text-left font-normal border-gray-300 hover:bg-gray-50", !dateValue && "text-muted-foreground")
      }, React.createElement(CalendarIcon, {
        className: "mr-2 h-4 w-4"
      }), dateValue ? format(dateValue, "PPP") : React.createElement("span", null, "Pick a date")))), React.createElement(PopoverContent, {
        className: "w-auto p-0",
        align: "start"
      }, React.createElement(Calendar, {
        mode: "single",
        selected: dateValue,
        onSelect: date => {
          if (date) {
            // Preserve time if exists, otherwise set to noon
            const existingDate = field.value ? new Date(field.value) : new Date();
            date.setHours(existingDate.getHours());
            date.setMinutes(existingDate.getMinutes());
            field.onChange(date.toISOString());
          }
        },
        disabled: date => date < new Date(new Date().setHours(0, 0, 0, 0)),
        initialFocus: true
      }))), React.createElement(Popover, null, React.createElement(PopoverTrigger, {
        asChild: true
      }, React.createElement(Button, {
        variant: "outline",
        className: cn("w-full pl-3 text-left font-normal border-gray-300 hover:bg-gray-50", !dateValue && "text-muted-foreground")
      }, React.createElement(Clock, {
        className: "mr-2 h-4 w-4"
      }), dateValue ? format(dateValue, "h:mm a") : React.createElement("span", null, "Pick a time"))), React.createElement(PopoverContent, {
        className: "w-64 p-4",
        align: "start",
        side: "top",
        sideOffset: 4
      }, React.createElement("div", {
        className: "space-y-3"
      }, React.createElement("div", {
        className: "text-sm font-medium text-gray-700"
      }, "Select Time"), React.createElement("div", {
        className: "grid grid-cols-2 gap-3"
      }, React.createElement("div", null, React.createElement("label", {
        className: "text-xs text-gray-500 mb-1 block"
      }, "Hour"), React.createElement(Select, {
        value: dateValue ? format(dateValue, "HH") : "12",
        onValueChange: hour => {
          const newDate = dateValue ? new Date(dateValue) : new Date();
          newDate.setHours(parseInt(hour));
          field.onChange(newDate.toISOString());
        }
      }, React.createElement(SelectTrigger, {
        className: "border-gray-300"
      }, React.createElement(SelectValue, null)), React.createElement(SelectContent, {
        position: "popper",
        sideOffset: 5
      }, Array.from({
        length: 24
      }, (_, i) => React.createElement(SelectItem, {
        key: i,
        value: i.toString().padStart(2, "0")
      }, i.toString().padStart(2, "0")))))), React.createElement("div", null, React.createElement("label", {
        className: "text-xs text-gray-500 mb-1 block"
      }, "Minute"), React.createElement(Select, {
        value: dateValue ? format(dateValue, "mm") : "00",
        onValueChange: minute => {
          const newDate = dateValue ? new Date(dateValue) : new Date();
          newDate.setMinutes(parseInt(minute));
          field.onChange(newDate.toISOString());
        }
      }, React.createElement(SelectTrigger, {
        className: "border-gray-300"
      }, React.createElement(SelectValue, null)), React.createElement(SelectContent, {
        position: "popper",
        sideOffset: 5
      }, Array.from({
        length: 60
      }, (_, i) => React.createElement(SelectItem, {
        key: i,
        value: i.toString().padStart(2, "0")
      }, i.toString().padStart(2, "0"))))))))))), React.createElement(FormMessage, null));
    }
  }), React.createElement(FormField, {
    control: form.control,
    name: "capacity",
    render: ({
      field
    }) => React.createElement(FormItem, null, React.createElement(FormLabel, {
      className: "text-gray-700 font-medium"
    }, "Capacity *"), React.createElement(FormControl, null, React.createElement(Input, _extends({
      type: "number",
      min: "1",
      placeholder: "50",
      className: "border-gray-300 focus:border-[#195ADC] focus:ring-[#195ADC]"
    }, field))), React.createElement(FormDescription, {
      className: "text-xs text-gray-500"
    }, "Total number of available slots"), React.createElement(FormMessage, null))
  }), React.createElement(FormField, {
    control: form.control,
    name: "ticket_price",
    render: ({
      field
    }) => React.createElement(FormItem, null, React.createElement(FormLabel, {
      className: "text-gray-700 font-medium"
    }, "General Ticket Price (\u20B9) *"), React.createElement(FormControl, null, React.createElement(Input, _extends({
      type: "number",
      min: "0",
      step: "0.01",
      placeholder: "0.00",
      className: "border-gray-300 focus:border-[#195ADC] focus:ring-[#195ADC]"
    }, field))), React.createElement(FormDescription, {
      className: "text-xs text-gray-500"
    }, "Price for the General tier in INR"), React.createElement(FormMessage, null))
  }), React.createElement(FormField, {
    control: form.control,
    name: "vip_ticket_price",
    render: ({
      field
    }) => React.createElement(FormItem, null, React.createElement(FormLabel, {
      className: "text-gray-700 font-medium"
    }, "VIP Ticket Price (\u20B9) Optional"), React.createElement(FormControl, null, React.createElement(Input, {
      type: "number",
      min: "0",
      step: "0.01",
      placeholder: "Leave blank to skip VIP tier",
      className: "border-gray-300 focus:border-[#195ADC] focus:ring-[#195ADC]",
      value: field.value ?? "",
      onChange: event => field.onChange(event.target.value),
      onBlur: field.onBlur,
      name: field.name,
      ref: field.ref
    })), React.createElement(FormDescription, {
      className: "text-xs text-gray-500"
    }, "Optional. If provided, it must be different from the General price."), React.createElement(FormMessage, null))
  }), React.createElement(FormField, {
    control: form.control,
    name: "platform_commission_percentage",
    render: ({
      field
    }) => React.createElement(FormItem, null, React.createElement(FormLabel, {
      className: "text-gray-700 font-medium"
    }, "CONVENEHUB Commission (%) *"), React.createElement(FormControl, null, React.createElement(Input, _extends({
      type: "number",
      min: "0",
      max: "100",
      step: "0.01",
      placeholder: "10.00",
      className: "border-gray-300 focus:border-[#195ADC] focus:ring-[#195ADC]"
    }, field))), React.createElement(FormDescription, {
      className: "text-xs text-gray-500"
    }, "Platform commission percentage (0-100). Default: 10%"), React.createElement(FormMessage, null))
  }))), React.createElement("div", {
    className: "space-y-4"
  }, React.createElement("div", {
    className: "pb-3 border-b border-gray-200"
  }, React.createElement("h3", {
    className: "text-lg font-semibold text-gray-900"
  }, "Additional Information"), React.createElement("p", {
    className: "text-sm text-gray-500 mt-1"
  }, "Optional instructions and publishing options")), React.createElement(FormField, {
    control: form.control,
    name: "entry_instructions",
    render: ({
      field
    }) => React.createElement(FormItem, null, React.createElement(FormLabel, {
      className: "text-gray-700 font-medium"
    }, "Entry Instructions"), React.createElement(FormControl, null, React.createElement(Textarea, _extends({
      placeholder: "Special instructions for attendees (optional)",
      className: "min-h-[100px] border-gray-300 focus:border-[#195ADC] focus:ring-[#195ADC] resize-none"
    }, field))), React.createElement(FormDescription, {
      className: "text-xs text-gray-500"
    }, "Any special requirements or rules for entry"), React.createElement(FormMessage, null))
  }), React.createElement(FormField, {
    control: form.control,
    name: "terms",
    render: ({
      field
    }) => React.createElement(FormItem, null, React.createElement(FormLabel, {
      className: "text-gray-700 font-medium"
    }, "Event Specific Terms & Conditions"), React.createElement(FormControl, null, React.createElement(Textarea, _extends({
      placeholder: "Enter specific rules, NDA clauses, or terms for this event...",
      className: "min-h-[120px] border-gray-300 focus:border-[#195ADC] focus:ring-[#195ADC] resize-none"
    }, field))), React.createElement(FormDescription, {
      className: "text-xs text-gray-500"
    }, "These terms will be shown to the user in a popup and they must agree before booking."), React.createElement(FormMessage, null))
  }), React.createElement(FormField, {
    control: form.control,
    name: "status",
    render: ({
      field
    }) => React.createElement(FormItem, null, React.createElement(FormLabel, {
      className: "text-gray-700 font-medium"
    }, "Event Status *"), React.createElement(Select, {
      onValueChange: field.onChange,
      defaultValue: field.value
    }, React.createElement(FormControl, null, React.createElement(SelectTrigger, {
      className: "border-gray-300 focus:border-[#195ADC] focus:ring-[#195ADC]"
    }, React.createElement(SelectValue, null))), React.createElement(SelectContent, null, React.createElement(SelectItem, {
      value: "draft"
    }, "Draft - Not visible to public"), React.createElement(SelectItem, {
      value: "published"
    }, "Published - Visible, bookings open"), React.createElement(SelectItem, {
      value: "checkin_open"
    }, "Check-in Open - Visible, bookings closed"), React.createElement(SelectItem, {
      value: "in_progress"
    }, "In Progress - Not visible, event ongoing"), React.createElement(SelectItem, {
      value: "ended"
    }, "Ended - Not visible, event completed"))), React.createElement(FormDescription, {
      className: "text-xs text-gray-500"
    }, "Select the current status of the event. Use Draft for new events."), React.createElement(FormMessage, null))
  })), React.createElement("div", {
    className: "pt-6 border-t border-gray-200"
  }, React.createElement(Button, {
    type: "submit",
    disabled: isSubmitting,
    className: "w-full md:w-auto min-w-[200px] bg-[#195ADC] hover:bg-[#378FFA] text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed h-11"
  }, isSubmitting ? React.createElement(React.Fragment, null, React.createElement(Spinner, {
    className: "mr-2 h-4 w-4 text-white"
  }), "Creating Event...") : React.createElement(React.Fragment, null, React.createElement(Send, {
    className: "mr-2 h-4 w-4"
  }), "Create Event")))));
}