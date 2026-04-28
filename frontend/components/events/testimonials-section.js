"use client";
import React from "react";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Star, Plus } from "lucide-react";
import { motion } from "framer-motion";
const TestimonialRating = () => React.createElement("div", {
  className: "flex gap-1 text-[#FFB02E] text-[10px]"
}, [...Array(5)].map((_, i) => React.createElement(Star, {
  key: i,
  className: "fill-current w-3 h-3"
})));

// Testimonial data for mobile carousel
const testimonials = [{
  name: "Priya Sharma",
  role: "Event Attendee • Mumbai",
  avatar: "/images/avatars/priya-sharma.png",
  quote: "The event was incredibly well organized from entry to exit. Easily one of my best live experiences."
}, {
  name: "Rahul Verma",
  role: "Content Creator • Delhi",
  avatar: "/images/avatars/rahul-verma.png",
  quote: "Booking was smooth, check-in was instant, and updates were always on time. Super reliable platform."
}, {
  name: "Ananya Patel",
  role: "Community Lead • Bangalore",
  avatar: "/images/avatars/ananya-patel.png",
  quote: "From ticket purchase to QR entry, everything worked flawlessly. Highly recommended for event teams."
}];

// Mobile Carousel Component
const MobileTestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);
  const handleTouchStart = e => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = e => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < testimonials.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }
    // Resume auto-scroll after 5 seconds
    setTimeout(() => setIsPaused(false), 5000);
  };
  const goToSlide = index => {
    setCurrentIndex(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5000);
  };
  return React.createElement("div", {
    className: "md:hidden"
  }, React.createElement("div", {
    className: "bg-gray-50 rounded-2xl p-6 mb-4"
  }, React.createElement("div", {
    className: "flex items-center justify-between"
  }, React.createElement("div", null, React.createElement("div", {
    className: "flex items-end gap-1 mb-1"
  }, React.createElement("span", {
    className: "text-4xl font-semibold tracking-tight"
  }, "4.9"), React.createElement("span", {
    className: "text-lg text-neutral-400 mb-1"
  }, "/5")), React.createElement("p", {
    className: "text-sm text-neutral-500"
  }, React.createElement("span", {
    className: "text-black font-medium"
  }, "50+"), " happy visitors")), React.createElement("div", {
    className: "flex -space-x-2"
  }, testimonials.slice(0, 3).map((t, i) => React.createElement("div", {
    key: i,
    className: "w-10 h-10 rounded-full bg-neutral-200 border-2 border-white overflow-hidden relative"
  }, React.createElement(Image, {
    src: t.avatar,
    alt: t.name,
    fill: true,
    className: "object-cover"
  })))))), React.createElement("div", {
    className: "relative overflow-hidden rounded-2xl",
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  }, React.createElement(motion.div, {
    className: "flex",
    animate: {
      x: `-${currentIndex * 100}%`
    },
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }, testimonials.map((testimonial, index) => React.createElement("div", {
    key: index,
    className: "w-full flex-shrink-0 bg-gray-50 rounded-2xl p-6"
  }, React.createElement("p", {
    className: "text-lg font-medium leading-relaxed text-gray-900 mb-6"
  }, '"', testimonial.quote, '"'), React.createElement("div", {
    className: "flex items-center gap-3"
  }, React.createElement("div", {
    className: "w-10 h-10 rounded-full overflow-hidden relative"
  }, React.createElement(Image, {
    src: testimonial.avatar,
    alt: testimonial.name,
    fill: true,
    className: "object-cover"
  })), React.createElement("div", null, React.createElement("h4", {
    className: "font-semibold text-sm text-gray-900"
  }, testimonial.name), React.createElement("p", {
    className: "text-xs text-neutral-500"
  }, testimonial.role)), React.createElement("div", {
    className: "ml-auto"
  }, React.createElement(TestimonialRating, null))))))), React.createElement("div", {
    className: "flex justify-center gap-2 mt-4"
  }, testimonials.map((_, index) => React.createElement("button", {
    key: index,
    onClick: () => goToSlide(index),
    className: `w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-gray-900 w-6" : "bg-gray-300"}`,
    "aria-label": `Go to testimonial ${index + 1}`
  }))));
};

// Desktop Grid Component (existing layout)
const DesktopTestimonialsGrid = () => React.createElement("div", {
  className: "hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-2"
}, React.createElement("div", {
  className: "flex flex-col gap-2"
}, React.createElement("div", {
  className: "bg-gray-50 rounded-xl p-8 h-full flex flex-col justify-between"
}, React.createElement("div", {
  className: "mb-12"
}, React.createElement("div", {
  className: "flex items-end gap-1 mb-2"
}, React.createElement("span", {
  className: "text-6xl font-medium tracking-tighter"
}, "4.9"), React.createElement("span", {
  className: "text-xl text-neutral-400 mb-2"
}, "/5")), React.createElement("p", {
  className: "text-neutral-500 leading-tight text-[15px] font-medium max-w-[200px]"
}, "We've served ", React.createElement("span", {
  className: "text-black"
}, "50+ attendees"), " across high-energy live events in India.")), React.createElement("div", null, React.createElement("div", {
  className: "mb-6"
}, React.createElement("h3", {
  className: "font-bold text-lg mb-3"
}, "ConveneHub"), React.createElement("div", {
  className: "flex items-center gap-2 mb-2"
}, React.createElement("div", {
  className: "flex -space-x-3"
}, ["/images/avatars/priya-sharma.png", "/images/avatars/rahul-verma.png", "/images/avatars/ananya-patel.png"].map((src, i) => React.createElement("div", {
  key: i,
  className: "w-8 h-8 rounded-full bg-neutral-200 border-2 border-white overflow-hidden relative"
}, React.createElement(Image, {
  src: src,
  alt: "User",
  fill: true,
  className: "object-cover opacity-80"
}))), React.createElement("div", {
  className: "w-8 h-8 rounded-full bg-black border-2 border-white flex items-center justify-center text-white text-[10px] z-10"
}, "10+"))), React.createElement("p", {
  className: "text-xs text-neutral-500 font-medium"
}, "Happy visitors across India"))))), React.createElement("div", {
  className: "flex flex-col gap-2 transition-all duration-300 hover:gap-0 group cursor-pointer"
}, React.createElement("div", {
  className: "bg-gray-50 rounded-xl p-5 flex items-center gap-4 transition-all duration-300 group-hover:rounded-b-none"
}, React.createElement("div", {
  className: "w-12 h-12 rounded-xl overflow-hidden relative shrink-0"
}, React.createElement(Image, {
  src: "/images/avatars/priya-sharma.png",
  alt: "Priya Sharma",
  fill: true,
  className: "object-cover"
})), React.createElement("div", null, React.createElement("h4", {
  className: "font-bold text-sm"
}, "Priya Sharma"), React.createElement("p", {
  className: "text-xs text-neutral-400 font-medium"
}, "Event Attendee \u2022 Mumbai"))), React.createElement("div", {
  className: "bg-gray-50 rounded-xl p-8 grow flex flex-col justify-between relative transition-all duration-300 group-hover:rounded-t-none"
}, React.createElement("div", {
  className: "absolute top-6 right-6 text-black transition-transform duration-300 group-hover:rotate-90"
}, React.createElement(Plus, {
  className: "w-5 h-5"
})), React.createElement("div", {
  className: "mb-8"
}, React.createElement(TestimonialRating, null)), React.createElement("p", {
  className: "text-2xl font-medium tracking-tight leading-tight"
}, "The event was incredibly well organized from entry to exit. Easily one of my best live experiences."))), React.createElement("div", {
  className: "flex flex-col gap-2 transition-all duration-300 hover:gap-0 group cursor-pointer"
}, React.createElement("div", {
  className: "bg-gray-50 rounded-xl p-8 grow flex flex-col justify-between relative transition-all duration-300 group-hover:rounded-b-none"
}, React.createElement("p", {
  className: "text-2xl font-medium tracking-tight leading-tight mb-8"
}, "Booking was smooth, check-in was instant, and updates were always on time. Super reliable platform."), React.createElement("div", null, React.createElement(TestimonialRating, null))), React.createElement("div", {
  className: "bg-gray-50 rounded-xl p-5 flex items-center gap-4 transition-all duration-300 group-hover:rounded-t-none"
}, React.createElement("div", {
  className: "w-12 h-12 rounded-xl overflow-hidden relative shrink-0"
}, React.createElement(Image, {
  src: "/images/avatars/rahul-verma.png",
  alt: "Rahul Verma",
  fill: true,
  className: "object-cover"
})), React.createElement("div", null, React.createElement("h4", {
  className: "font-bold text-sm"
}, "Rahul Verma"), React.createElement("p", {
  className: "text-xs text-neutral-400 font-medium"
}, "Content Creator \u2022 Delhi")), React.createElement("div", {
  className: "ml-auto text-black transition-transform duration-300 group-hover:rotate-90"
}, React.createElement(Plus, {
  className: "w-5 h-5"
})))), React.createElement("div", {
  className: "flex flex-col gap-2 transition-all duration-300 hover:gap-0 group cursor-pointer"
}, React.createElement("div", {
  className: "bg-gray-50 rounded-xl p-5 flex items-center gap-4 transition-all duration-300 group-hover:rounded-b-none"
}, React.createElement("div", {
  className: "w-12 h-12 rounded-xl overflow-hidden relative shrink-0"
}, React.createElement(Image, {
  src: "/images/avatars/ananya-patel.png",
  alt: "Ananya Patel",
  fill: true,
  className: "object-cover"
})), React.createElement("div", null, React.createElement("h4", {
  className: "font-bold text-sm"
}, "Ananya Patel"), React.createElement("p", {
  className: "text-xs text-neutral-400 font-medium"
}, "Community Lead \u2022 Bangalore"))), React.createElement("div", {
  className: "bg-gray-50 rounded-xl p-8 grow flex flex-col justify-between relative transition-all duration-300 group-hover:rounded-t-none"
}, React.createElement("div", {
  className: "absolute top-6 right-6 text-black transition-transform duration-300 group-hover:rotate-90"
}, React.createElement(Plus, {
  className: "w-5 h-5"
})), React.createElement("div", {
  className: "mb-8"
}, React.createElement(TestimonialRating, null)), React.createElement("p", {
  className: "text-2xl font-medium tracking-tight leading-tight"
}, "From ticket purchase to QR entry, everything worked flawlessly. Highly recommended for event teams."))));
export default function TestimonialsSection() {
  return React.createElement("section", {
    className: "py-12 px-4 md:px-6 bg-white text-black overflow-hidden"
  }, React.createElement("div", {
    className: "max-w-7xl mx-auto"
  }, React.createElement(MobileTestimonialCarousel, null), React.createElement(DesktopTestimonialsGrid, null)));
}