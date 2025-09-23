"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section } from '@/components/ui/Section';
import { TestimonialCard } from '@/components/ui/TestimonialCard';

export const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Best testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Narayana Patel",
      role: "EV Owner",
      content: "EV Bunker has completely transformed my charging experience. No more waiting in long queues or searching for available stations. The app makes everything seamless.",
      rating: 5,
    },
    {
      id: 2,
      name: "Krishna Sagar",
      role: "Fleet Manager",
      content: "As a fleet manager, I need reliable charging solutions for my electric vehicles. EV Bunker's network and booking system have saved us countless hours and improved efficiency.",
      rating: 5,
    },
    {
      id: 3,
      name: "Priya Sharma",
      role: "Daily Commuter",
      content: "I use EV Bunker for my daily commute charging needs. The real-time availability and fast charging have made my transition to electric vehicles effortless.",
      rating: 5,
    },
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Function to render star ratings
  const renderRating = (rating: number) => {
    return (
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <motion.svg
            key={i}
            className={`w-5 h-5 ${i < rating ? 'text-[#F59E0B]' : 'text-[#475569]'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </motion.svg>
        ))}
      </div>
    );
  };

  return (
    <Section id="testimonials" className="bg-[#1E293B] section-responsive relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] opacity-10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] opacity-10 blur-3xl"></div>
      
      <div className="container mx-auto relative z-10">
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

        {/* Testimonial Slider */}
        <div className="max-w-4xl mx-auto">
          <TestimonialCard className="p-8 md:p-10 lg:p-12 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] opacity-10 blur-3xl"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] opacity-10 blur-3xl"></div>
            
            <div className="relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="text-center"
                >
                  {/* Rating */}
                  {renderRating(testimonials[currentIndex].rating)}
                  
                  {/* Testimonial content */}
                  <div className="mb-8">
                    <p className="text-[#F1F5F9] text-lg md:text-xl italic leading-relaxed max-w-2xl mx-auto">
                      "{testimonials[currentIndex].content}"
                    </p>
                  </div>
                  
                  {/* User info */}
                  <div className="mb-2">
                    <h3 className="text-xl md:text-2xl font-bold text-[#F1F5F9]">{testimonials[currentIndex].name}</h3>
                    <p className="text-[#94A3B8] text-base mt-1">{testimonials[currentIndex].role}</p>
                  </div>
                  
                  {/* Decorative quote marks */}
                  <div className="absolute top-6 left-6 text-[#8B5CF6] opacity-20 text-7xl font-serif">"</div>
                  <div className="absolute bottom-6 right-6 text-[#8B5CF6] opacity-20 text-7xl font-serif rotate-180">"</div>
                </motion.div>
              </AnimatePresence>
              
              {/* Navigation Dots */}
              <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_, index) => (
                  <motion.button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? "bg-gradient-to-r from-[#8B5CF6] to-[#10B981] w-8" 
                        : "bg-[#475569]"
                    }`}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`View testimonial ${index + 1}`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            </div>
          </TestimonialCard>
          
          {/* Navigation Arrows */}
          <div className="flex justify-between mt-6">
            <motion.button
              className="p-3 rounded-full bg-[#334155] border border-[#475569] text-[#CBD5E1] hover:bg-gradient-to-r hover:from-[#8B5CF6] hover:to-[#10B981] hover:text-white transition-all duration-300"
              onClick={() => setCurrentIndex((currentIndex - 1 + testimonials.length) % testimonials.length)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Previous testimonial"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
            
            <motion.button
              className="p-3 rounded-full bg-[#334155] border border-[#475569] text-[#CBD5E1] hover:bg-gradient-to-r hover:from-[#8B5CF6] hover:to-[#10B981] hover:text-white transition-all duration-300"
              onClick={() => setCurrentIndex((currentIndex + 1) % testimonials.length)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Next testimonial"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </Section>
  );
};