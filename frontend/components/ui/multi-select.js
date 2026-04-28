"use client";

import * as React from "react";
import { Check, X, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
  disabled = false
}) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const handleSelect = value => {
    const newSelected = selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value];
    onChange(newSelected);
  };
  const handleRemove = (value, e) => {
    if (e) {
      e.stopPropagation();
    }
    onChange(selected.filter(item => item !== value));
  };
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;
    return options.filter(option => option.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [options, searchQuery]);
  return React.createElement(Popover, {
    open: open,
    onOpenChange: setOpen
  }, React.createElement(PopoverTrigger, {
    asChild: true
  }, React.createElement(Button, {
    variant: "outline",
    role: "combobox",
    "aria-expanded": open,
    className: cn("w-full justify-between min-h-10 h-auto", className),
    disabled: disabled
  }, React.createElement("div", {
    className: "flex flex-wrap gap-1 flex-1"
  }, selected.length > 0 ? selected.map(value => {
    const option = options.find(opt => opt.value === value);
    if (!option) return null;
    return React.createElement(Badge, {
      key: value,
      variant: "secondary",
      className: "mr-1 mb-1"
    }, option.label, React.createElement(X, {
      className: "ml-1 h-3 w-3 cursor-pointer hover:text-destructive",
      onClick: e => handleRemove(value, e)
    }));
  }) : React.createElement("span", {
    className: "text-muted-foreground"
  }, placeholder)), React.createElement(ChevronsUpDown, {
    className: "ml-2 h-4 w-4 shrink-0 opacity-50"
  }))), React.createElement(PopoverContent, {
    className: "w-[400px] p-0",
    align: "start"
  }, React.createElement("div", {
    className: "flex flex-col"
  }, React.createElement("div", {
    className: "flex items-center border-b px-3 py-2"
  }, React.createElement("input", {
    type: "text",
    placeholder: "Search...",
    value: searchQuery,
    onChange: e => setSearchQuery(e.target.value),
    className: "flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
  })), React.createElement(ScrollArea, {
    className: "max-h-64"
  }, React.createElement("div", {
    className: "p-1"
  }, filteredOptions.length === 0 ? React.createElement("div", {
    className: "py-6 text-center text-sm text-muted-foreground"
  }, "No items found.") : filteredOptions.map(option => {
    const isSelected = selected.includes(option.value);
    return React.createElement("div", {
      key: option.value,
      onClick: () => handleSelect(option.value),
      className: cn("relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground", isSelected && "bg-accent")
    }, React.createElement(Check, {
      className: cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")
    }), option.label);
  }))))));
}