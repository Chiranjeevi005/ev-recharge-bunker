"use client";

import React, { useEffect, useRef, Suspense } from 'react';
// Removed motion import since we're removing motion components
import maplibregl from 'maplibre-gl';
// @ts-ignore
import 'maplibre-gl/dist/maplibre-gl.css';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { useContactForm } from '@/hooks/useContactForm';
import { useRouteTransition } from '@/hooks/useRouteTransition';
import { LoadingSpinner } from '@/components/common/LoadingSpinner'; // Added import

// Loading component for Suspense
function Loading() {
  return (
    <div className="min-h-screen bg-[#1E293B] flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-[#CBD5E1]">Loading...</p>
      </div>
    </div>
  );
}

const ContactPageContent = () => {
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
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  
  // Initialize route transition handler
  useRouteTransition();

  // Initialize the map for headquarters location
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up any existing map instance
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Create map instance centered on Bangalore headquarters
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [77.5946, 12.9716], // Bangalore coordinates
      zoom: 14,
      attributionControl: false
    });

    mapRef.current = map;

    // Add navigation controls
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Add marker for headquarters
    const el = document.createElement('div');
    el.className = 'headquarters-marker';
    el.innerHTML = `
      <div class="relative">
        <div class="w-8 h-8 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] border-2 border-white flex items-center justify-center shadow-lg">
          <span class="text-white text-lg font-bold">⚡</span>
        </div>
        <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[#1E293B] text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
          EV Bunker HQ
        </div>
      </div>
    `;

    new maplibregl.Marker({
      element: el,
      anchor: 'center'
    })
      .setLngLat([77.5946, 12.9716]) // Bangalore coordinates
      .addTo(map);

    // Clean up on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    // Show loader during form submission
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
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
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
      action: "+91 9876543210" 
    }
  ];

  // Deterministic particle positions to avoid hydration errors
  const particlePositions = [
    { left: 10, top: 10 },
    { left: 25, top: 25 },
    { left: 40, top: 40 },
    { left: 55, top: 55 },
    { left: 70, top: 70 },
    { left: 85, top: 85 },
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
              // Replaced motion.div with regular div and kept essential animations
              <div
                key={i}
                className="absolute w-1 h-1 bg-[#8B5CF6] rounded-full animate-bounce"
                style={{
                  left: `${pos.left}%`,
                  top: `${pos.top}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
        </div>
        
        <Navbar />
        
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Let's Power the Future <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#10B981]">Together</span>
            </h1>
            <p className="text-xl text-[#CBD5E1] mb-10">
              Reach out for support, partnerships, or inquiries. We're here to keep your EV journey seamless.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
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
                
                {/* Replaced motion.div with regular div */}
                {submitStatus === 'success' && (
                  <div className="mt-4 p-6 bg-green-500/20 border border-green-500/50 rounded-xl text-green-300 text-center animate-fadeIn">
                    <div className="flex justify-center mb-4">
                      <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <p className="mt-2">Message sent successfully! We'll get back to you soon.</p>
                  </div>
                )}
                
                {/* Replaced motion.div with regular div */}
                {submitStatus === 'error' && (
                  <div className="mt-4 p-6 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-center animate-fadeIn">
                    <div className="flex justify-center mb-4">
                      <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <p className="mt-2">Oops! Something went wrong. Please try again.</p>
                  </div>
                )}
              </form>
            </Card>
          </div>
          
          {/* Quick Contact Options */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Quick Contact</h2>
              <p className="text-[#94A3B8] mb-8">Need immediate assistance? Reach out through these channels:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-6">
                {contactOptions.map((option, index) => (
                  // Replaced motion.div with regular div
                  <div
                    key={index}
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
                  </div>
                ))}
              </div>
            </div>
            
            {/* Map Section */}
            <div className="bg-[#1E293B]/50 backdrop-blur-xl border border-[#475569]/50 rounded-2xl p-6 shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-4">Find Us on the Map</h3>
              <div className="relative rounded-xl overflow-hidden border border-[#475569] shadow-lg h-80">
                {/* Map container */}
                <div ref={mapContainerRef} className="w-full h-full" />
                
                {/* Location info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1E293B]/90 to-transparent p-4">
                  <div className="text-white font-medium">EV Bunker Headquarters</div>
                  <div className="text-[#94A3B8] text-sm">Bangalore, India</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Footer */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] border-t border-[#334155]/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
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
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

// Wrap the component in Suspense to handle useSearchParams issues in Next.js 15
export default function ContactPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ContactPageContent />
    </Suspense>
  );
}