"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: "01",
      title: "Search Bunks",
      description: "Find nearby charging stations with real-time availability and pricing across Indian cities.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      step: "02",
      title: "Book Slot",
      description: "Reserve your charging time in advance to guarantee availability at any EV Bunker station.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      step: "03",
      title: "Recharge & Go",
      description: "Arrive, charge your EV, and continue your journey refreshed across India.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ];

  return (
    <Section id="how-it-works" className="bg-gradient-to-br from-[#1E293B] to-[#334155] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#8B5CF6]/10"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#F1F5F9] mb-4">
            How It Works
          </h2>
          <p className="text-lg text-[#CBD5E1] max-w-2xl mx-auto">
            Getting your EV charged has never been easier. Follow these simple steps.
          </p>
        </motion.div>

        <div className="relative">
          {/* Animated connecting lines */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 z-0">
            <motion.div 
              className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-[#8B5CF6] via-[#10B981] to-[#059669] opacity-30"
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 2, delay: 0.5 }}
            />
            <motion.div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#8B5CF6] via-[#10B981] to-[#059669]"
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 2, delay: 0.5 }}
            />
          </div>
          
          {/* Animated dots on connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-4 -mt-2 z-0">
            {[0, 50, 100].map((position, index) => (
              <motion.div
                key={index}
                className="absolute top-1/2 w-4 h-4 rounded-full bg-[#10B981] border-2 border-[#F1F5F9]"
                style={{ left: `${position}%`, transform: 'translate(-50%, -50%)' }}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1 + index * 0.2 }}
              >
                <div className="absolute inset-0 w-4 h-4 rounded-full bg-[#10B981] animate-ping opacity-75"></div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card className="h-full text-center relative">
                  {/* Animated step indicator */}
                  <motion.div
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white font-bold z-20"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
                  >
                    {step.step}
                    <motion.div 
                      className="absolute inset-0 rounded-full bg-[#8B5CF6] opacity-75"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                    />
                  </motion.div>
                  
                  <div className="p-8 pt-12">
                    <div className="mb-4 flex justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.2 + 0.7 }}
                      >
                        {step.icon}
                      </motion.div>
                    </div>
                    <motion.h3 
                      className="text-xl font-bold text-[#F1F5F9] mb-2"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.2 + 0.9 }}
                    >
                      {step.title}
                    </motion.h3>
                    <motion.p 
                      className="text-[#CBD5E1]"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.2 + 1.1 }}
                    >
                      {step.description}
                    </motion.p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};