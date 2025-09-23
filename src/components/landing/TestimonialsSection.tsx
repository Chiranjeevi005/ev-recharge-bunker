"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';

export const TestimonialsSection: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  // Placeholder data - to be replaced with real testimonials from database
  const testimonials = [
    {
      name: "Narayana Patel",
      role: "EV Owner",
      content: "Real user testimonials will be displayed here once users start sharing their experiences with our platform.",
      avatar: "UN",
    },
    {
      name: "Krishna Sagar",
      role: "EV Driver",
      content: "Real user testimonials will be displayed here once users start sharing their experiences with our platform.",
      avatar: "UN",
    },
    {
      name: "Vendanta Kumar",
      role: "EV Enthusiast",
      content: "Real user testimonials will be displayed here once users start sharing their experiences with our platform.",
      avatar: "UN",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <Section id="testimonials" className="bg-[#1E293B] section-responsive">
      <div className="container mx-auto">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-responsive-2xl font-bold text-[#F1F5F9] mb-3 sm:mb-4">
            User Experiences
          </h2>
          <p className="text-base sm:text-lg text-[#CBD5E1] max-w-2xl mx-auto px-4">
            Hear from our community of EV drivers who have embraced the future of charging.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <Card className="p-6 sm:p-8 md:p-10 lg:p-12">
            <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-[#8B5CF6] opacity-10"></div>
            <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-[#10B981] opacity-10"></div>
            
            <div className="relative z-10">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center mb-5 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] flex items-center justify-center text-white font-bold text-lg sm:text-xl mr-3 sm:mr-4">
                    {testimonials[currentTestimonial].avatar}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#F1F5F9]">{testimonials[currentTestimonial].name}</h3>
                    <p className="text-[#94A3B8] text-sm sm:text-base">{testimonials[currentTestimonial].role}</p>
                  </div>
                </div>
                
                <p className="text-[#CBD5E1] italic text-sm sm:text-base md:text-lg">
                  "{testimonials[currentTestimonial].content}"
                </p>
              </motion.div>
              
              <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                      index === currentTestimonial ? "bg-[#8B5CF6]" : "bg-[#475569]"
                    }`}
                    onClick={() => setCurrentTestimonial(index)}
                    aria-label={`View testimonial ${index + 1}`}
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