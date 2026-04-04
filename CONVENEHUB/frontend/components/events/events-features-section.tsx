'use client'
import React from 'react'
import { Shield, Ticket, Bell, Gift, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function EventsFeaturesSection() {
  const features = [
    {
      icon: Ticket,
      title: "Instant QR Tickets",
      description: "Digital tickets delivered instantly via email. Simple, secure check-in."
    },
    {
      icon: Shield,
      title: "Verified Events",
      description: "Trusted organizers and verified listings for a secure experience."
    },
    {
      icon: Bell,
      title: "Real-time Updates",
      description: "Stay informed with instant notifications about your booking status."
    },
    {
      icon: Gift,
      title: "Exclusive Access",
      description: "Limited seats and early-access drops for high-demand events."
    }
  ]

  const steps = [
    { number: "01", title: "Browse", description: "Explore upcoming events" },
    { number: "02", title: "Book", description: "Reserve your spot" },
    { number: "03", title: "Receive", description: "Get your QR ticket" },
    { number: "04", title: "Experience", description: "Check in and enjoy the event" }
  ]

  return (
    <>
      {/* How It Works Section */}
      <section className="relative py-32 px-6 bg-white">
        <div className="relative mx-auto max-w-6xl">

          {/* Section Label */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="inline-flex items-center gap-2 mb-6 text-sm text-gray-500 tracking-wide uppercase"
            >
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                className="w-8 h-[1px] bg-gray-300 origin-left"
              />
              How It Works
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                className="w-8 h-[1px] bg-gray-300 origin-right"
              />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            >
              Four Simple Steps
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-gray-600 text-lg max-w-2xl mx-auto"
            >
              From discovery to check-in in minutes
            </motion.p>
          </div>

          {/* Steps - Horizontal Flow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.15,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                className="relative"
              >
                {/* Step Card */}
                <div className="group">
                  {/* Number */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.15 + 0.2,
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                    className="text-7xl font-bold text-gray-100 mb-4 transition-colors duration-300"
                  >
                    {step.number}
                  </motion.div>

                  {/* Content */}
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h4>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>

                {/* Arrow Connector */}
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.15 + 0.4,
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                    className="hidden md:block absolute top-12 -right-4 text-gray-300"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-6 bg-white">
        <div className="relative mx-auto max-w-7xl">

          {/* Section Label */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="inline-flex items-center gap-2 mb-6 text-sm text-gray-500 tracking-wide uppercase"
            >
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                className="w-8 h-[1px] bg-gray-300 origin-left"
              />
              Why Book With Us
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                className="w-8 h-[1px] bg-gray-300 origin-right"
              />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-4xl md:text-5xl font-bold text-gray-900"
            >
              Seamless Experience
            </motion.h2>
          </div>

          {/* Features Grid - Minimal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                className="group bg-[#F9FAFB] p-8 rounded-2xl transition-all duration-300 hover:translate-y-[-4px]"
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-900 mb-6 shadow-sm"
                >
                  <feature.icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-[15px] font-medium">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
