"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';

export const TestimonialsSection: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const testimonials = [
    {
      name: "Narayana Patel",
      role: "Tata Nexon EV Owner",
      content: "The EV Bunker network has completely transformed my charging experience in Mumbai. No more waiting in lines or hunting for available stations. The app makes it so easy to find and book charging slots ahead of time.",
      avatar: "AS",
    },
    {
      name: "Priya Patel",
      role: "MG ZS EV Driver",
      content: "I've been using EV Bunkers for over a year now, and the reliability is unmatched. The stations are always clean, well-maintained, and the ultra-fast charging means I'm back on the road in no time. Great service across Delhi NCR!",
      avatar: "PP",
    },
    {
      name: "Rohan Gupta",
      role: "Hyundai Kona Enthusiast",
      content: "The futuristic design and seamless payment system make every charging session feel premium. The real-time updates keep me informed, and I love how the network continues to expand to new locations across India.",
      avatar: "RG",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <Section id="testimonials" className="bg-[#1E293B]">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#F1F5F9] mb-4">
            User Experiences
          </h2>
          <p className="text-lg text-[#CBD5E1] max-w-2xl mx-auto">
            Hear from our community of EV drivers who have embraced the future of charging.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <Card className="p-8 md:p-12">
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#8B5CF6] opacity-10"></div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-[#10B981] opacity-10"></div>
            
            <div className="relative z-10">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] flex items-center justify-center text-white font-bold text-xl mr-4">
                    {testimonials[currentTestimonial].avatar}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#F1F5F9]">{testimonials[currentTestimonial].name}</h3>
                    <p className="text-[#94A3B8]">{testimonials[currentTestimonial].role}</p>
                  </div>
                </div>
                
                <p className="text-lg text-[#CBD5E1] italic">
                  "{testimonials[currentTestimonial].content}"
                </p>
              </motion.div>
              
              <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentTestimonial ? "bg-[#8B5CF6]" : "bg-[#475569]"
                    }`}
                    onClick={() => setCurrentTestimonial(index)}
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
};