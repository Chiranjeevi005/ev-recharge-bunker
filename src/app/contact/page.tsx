"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { useContactForm } from '@/hooks/useContactForm';
import { useLoader } from '@/lib/LoaderContext'; // Added import

const ContactPage = () => {
  const {
    formData,
    setFormData,
    isSubmitting,
    setIsSubmitting,
    submitStatus,
    setSubmitStatus,
    handleChange,
    resetForm
  } = useContactForm();
  
  const { showLoader, hideLoader } = useLoader(); // Added loader context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    showLoader("Sending your message..."); // Show loader
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Reset form
        resetForm();
        setSubmitStatus('success');
        hideLoader(); // Hide loader
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      hideLoader(); // Hide loader
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick contact options
  const contactOptions = [
    {
      title: "Support",
      description: "Get help with your bookings or account",
      icon: "🎧",
      action: "support@evbunker.com"
    },
    {
      title: "Partnerships",
      description: "Explore business opportunities with us",
      icon: "🤝",
      action: "partnerships@evbunker.com"
    },
    {
      title: "Emergency Help",
      description: "24/7 assistance for urgent issues",
      icon: "🆘",
      action: "+1 (800) EV-CHARGE"
    }
  ];

  // Deterministic particle positions to avoid hydration errors
  const particlePositions = [
    { left: 10, top: 10, delay: 0 },
    { left: 25, top: 25, delay: 0.3 },
    { left: 40, top: 40, delay: 0.6 },
    { left: 55, top: 55, delay: 0.9 },
    { left: 70, top: 70, delay: 1.2 },
    { left: 85, top: 85, delay: 1.5 },
  ];

  return (
    <div className="min-h-screen bg-[#1E293B]">
      {/* Hero Section with Electric Animation */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155]">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#8B5CF6]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#10B981]/20 rounded-full blur-3xl animate-pulse"></div>
          
          {/* Electric line animation */}
          <div className="absolute top-0 left-0 w-full h-1">
            <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent animate-move-line"></div>
          </div>
          
          {/* Particle effects - using deterministic positions to avoid hydration errors */}
          <div className="absolute inset-0">
            {/* Predefined particle positions to ensure SSR/CSR consistency */}
            {particlePositions.map((pos, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[#8B5CF6] rounded-full"
                style={{
                  left: `${pos.left}%`,
                  top: `${pos.top}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: pos.delay,
                }}
              />
            ))}
          </div>
        </div>
        
        <Navbar />
        
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Let's Power the Future <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#10B981]">Together</span>
            </h1>
            <p className="text-xl text-[#CBD5E1] mb-10">
              Reach out for support, partnerships, or inquiries. We're here to keep your EV journey seamless.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-[#1E293B]/50 backdrop-blur-xl border border-[#475569]/50 p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-2">Get in Touch</h2>
              <p className="text-[#94A3B8] mb-8">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder=" "
                      className="w-full bg-[#334155]/50 border border-[#475569] rounded-xl py-5 px-4 text-white placeholder-transparent focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/30 transition-all duration-300 peer"
                      required
                    />
                    <label className="absolute left-4 top-4 text-[#94A3B8] peer-focus:text-[#8B5CF6] peer-focus:text-sm peer-focus:top-2 transition-all duration-300 pointer-events-none">
                      Your Name
                    </label>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#10B981] opacity-0 peer-focus:opacity-20 transition-opacity duration-300 -z-10 blur"></div>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder=" "
                      className="w-full bg-[#334155]/50 border border-[#475569] rounded-xl py-5 px-4 text-white placeholder-transparent focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/30 transition-all duration-300 peer"
                      required
                    />
                    <label className="absolute left-4 top-4 text-[#94A3B8] peer-focus:text-[#8B5CF6] peer-focus:text-sm peer-focus:top-2 transition-all duration-300 pointer-events-none">
                      Email Address
                    </label>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#10B981] opacity-0 peer-focus:opacity-20 transition-opacity duration-300 -z-10 blur"></div>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder=" "
                      className="w-full bg-[#334155]/50 border border-[#475569] rounded-xl py-5 px-4 text-white placeholder-transparent focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/30 transition-all duration-300 peer"
                      required
                    />
                    <label className="absolute left-4 top-4 text-[#94A3B8] peer-focus:text-[#8B5CF6] peer-focus:text-sm peer-focus:top-2 transition-all duration-300 pointer-events-none">
                      Subject
                    </label>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#10B981] opacity-0 peer-focus:opacity-20 transition-opacity duration-300 -z-10 blur"></div>
                  </div>
                  
                  <div className="relative">
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder=" "
                      rows={5}
                      className="w-full bg-[#334155]/50 border border-[#475569] rounded-xl py-5 px-4 text-white placeholder-transparent focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/30 transition-all duration-300 peer resize-none"
                      required
                    ></textarea>
                    <label className="absolute left-4 top-4 text-[#94A3B8] peer-focus:text-[#8B5CF6] peer-focus:text-sm peer-focus:top-2 transition-all duration-300 pointer-events-none">
                      Your Message
                    </label>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#10B981] opacity-0 peer-focus:opacity-20 transition-opacity duration-300 -z-10 blur"></div>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white font-bold py-4 px-6 rounded-xl hover:from-[#7C3AED] hover:to-[#059669] transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                  glow
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Send Message ⚡
                    </span>
                  )}
                </Button>
                
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-6 bg-green-500/20 border border-green-500/50 rounded-xl text-green-300 text-center"
                  >
                    <div className="flex justify-center mb-4">
                      <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <p className="mt-2">Message sent successfully! We'll get back to you soon.</p>
                  </motion.div>
                )}
                
                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-6 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-center"
                  >
                    <div className="flex justify-center mb-4">
                      <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <p className="mt-2">Oops! Something went wrong. Please try again.</p>
                  </motion.div>
                )}
              </form>
            </Card>
          </motion.div>
          
          {/* Quick Contact Options */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-white mb-6">Quick Contact</h2>
              <p className="text-[#94A3B8] mb-8">Need immediate assistance? Reach out through these channels:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-6">
                {contactOptions.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-[#1E293B]/50 backdrop-blur-xl border border-[#475569]/50 rounded-2xl p-6 shadow-xl hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300 group"
                  >
                    <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {option.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#8B5CF6] transition-colors duration-300">
                      {option.title}
                    </h3>
                    <p className="text-[#94A3B8] mb-4">{option.description}</p>
                    <div className="text-[#8B5CF6] font-medium group-hover:text-[#A78BFA] transition-colors duration-300">
                      {option.action}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* Map Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-[#1E293B]/50 backdrop-blur-xl border border-[#475569]/50 rounded-2xl p-6 shadow-xl"
            >
              <h3 className="text-2xl font-bold text-white mb-4">Find Us on the Map</h3>
              <div className="relative rounded-xl overflow-hidden border border-[#475569] shadow-lg">
                {/* Futuristic map background */}
                <div className="relative h-64 bg-gradient-to-br from-[#334155] to-[#1E293B]">
                  {/* Grid lines */}
                  <div className="absolute inset-0 opacity-20">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="absolute top-0 bottom-0 w-px bg-[#8B5CF6]/20" style={{ left: `${i * 12.5}%` }}></div>
                    ))}
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="absolute left-0 right-0 h-px bg-[#10B981]/20" style={{ top: `${i * 16.66}%` }}></div>
                    ))}
                  </div>
                  
                  {/* Connection lines */}
                  <div className="absolute inset-0">
                    <div className="absolute top-1/3 left-1/4 w-1/2 h-px bg-[#8B5CF6]/30"></div>
                    <div className="absolute top-2/3 left-1/3 w-1/3 h-px bg-[#10B981]/30"></div>
                  </div>
                  
                  {/* Main location marker */}
                  <motion.div
                    className="absolute w-8 h-8 rounded-full bg-[#10B981] border-2 border-[#F1F5F9] flex items-center justify-center"
                    style={{ left: "50%", top: "50%" }}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      boxShadow: [
                        "0 0 0 0 rgba(16, 185, 129, 0.7)",
                        "0 0 0 10px rgba(16, 185, 129, 0)",
                        "0 0 0 0 rgba(16, 185, 129, 0.7)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#F1F5F9]"></div>
                  </motion.div>
                  
                  {/* Secondary markers - using deterministic positions */}
                  <motion.div
                    className="absolute w-5 h-5 rounded-full bg-[#8B5CF6] border border-[#F1F5F9] flex items-center justify-center"
                    style={{ left: "30%", top: "30%" }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-[#F1F5F9]"></div>
                  </motion.div>
                  
                  <motion.div
                    className="absolute w-5 h-5 rounded-full bg-[#F59E0B] border border-[#F1F5F9] flex items-center justify-center"
                    style={{ left: "70%", top: "40%" }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-[#F1F5F9]"></div>
                  </motion.div>
                </div>
                
                {/* Location info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1E293B]/90 to-transparent p-4">
                  <div className="text-white font-medium">EV Bunker Headquarters</div>
                  <div className="text-[#94A3B8] text-sm">Bangalore, India</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* CTA Footer */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] border-t border-[#334155]/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              We're charging the future, one connection at a time.
            </h2>
            <p className="text-xl text-[#94A3B8] mb-10">
              Get in touch and be part of the EV revolution.
            </p>
            <Button
              variant="secondary"
              className="bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white font-bold px-8 py-4 rounded-xl hover:from-[#7C3AED] hover:to-[#059669] transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]"
              glow
            >
              Get Started
            </Button>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ContactPage;