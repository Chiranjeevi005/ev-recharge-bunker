"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Toast from '@/components/common/Toast';

export const Footer: React.FC = () => {
  // Simplified navigation with only required items
  const navigation = {
    product: [
      { name: 'Find Bunks', href: '/find-bunks' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Terms', href: '/terms' },
      { name: 'Privacy', href: '/privacy' },
      { name: 'Security', href: '/security' },
    ],
  };

  const [email, setEmail] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this to your backend
    console.log('Email submitted:', email);
    
    // Show success toast
    setToast({
      message: 'Thank you for subscribing!',
      type: 'success'
    });
    
    setEmail('');
  };

  return (
    <footer className="bg-[#1E293B] border-t border-[#334155]">
      <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-6 xs:py-8 sm:py-10 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-6 sm:gap-8 lg:gap-10">
          {/* Company Info - Full width on mobile, 1/4 on large screens */}
          <div className="xs:col-span-2 md:col-span-2 lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="h-full flex flex-col"
            >
              <h2 className="text-lg xs:text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#10B981] to-[#059669] mb-3 xs:mb-4">
                EV Bunker
              </h2>
              <p className="text-[#94A3B8] mb-4 xs:mb-6 text-xs xs:text-sm sm:text-base leading-relaxed">
                Revolutionizing electric vehicle charging with a seamless, futuristic experience. 
                Powering the future of sustainable transportation.
              </p>
            </motion.div>
          </div>
          
          {/* Product Links - 1/2 width on medium, 1/4 on large */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-sm xs:text-base sm:text-lg font-semibold mb-3 xs:mb-4 text-[#F1F5F9] uppercase tracking-wider">
                Product
              </h3>
              <ul className="space-y-2 xs:space-y-3">
                {navigation.product.map((link, linkIndex) => (
                  <motion.li 
                    key={link.name}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link 
                      href={link.href} 
                      className="text-[#94A3B8] hover:text-[#F1F5F9] transition-colors duration-200 text-xs xs:text-sm sm:text-base"
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
          
          {/* Legal Links - 1/2 width on medium, 1/4 on large */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-sm xs:text-base sm:text-lg font-semibold mb-3 xs:mb-4 text-[#F1F5F9] uppercase tracking-wider">
                Legal
              </h3>
              <ul className="space-y-2 xs:space-y-3">
                {navigation.legal.map((link, linkIndex) => (
                  <motion.li 
                    key={link.name}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link 
                      href={link.href} 
                      className="text-[#94A3B8] hover:text-[#F1F5F9] transition-colors duration-200 text-xs xs:text-sm sm:text-base"
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
          
          {/* Contact Section - Full width on mobile, 1/2 on medium, 1/4 on large */}
          <div className="xs:col-span-2 md:col-span-2 lg:col-span-1 md:col-start-1 lg:col-start-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-[#334155]/30 border border-[#475569] rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-5 md:p-6 h-full"
            >
              <h3 className="text-sm xs:text-base sm:text-lg font-semibold mb-3 xs:mb-4 text-[#F1F5F9] uppercase tracking-wider">
                Get in Touch
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3 xs:space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full px-3 xs:px-4 py-2 xs:py-3 bg-[#1E293B] border border-[#475569] rounded-lg text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent placeholder-[#94A3B8] text-xs xs:text-sm sm:text-base"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#10B981] text-white font-medium py-2 xs:py-3 px-3 xs:px-4 rounded-lg hover:from-[#7C3AED] hover:to-[#059669] transition-all duration-300 text-xs xs:text-sm sm:text-base"
                >
                  Subscribe
                </button>
              </form>
            </motion.div>
          </div>
        </div>
        
        <motion.div 
          className="border-t border-[#334155] mt-6 xs:mt-8 sm:mt-10 pt-4 xs:pt-6 flex flex-col xs:flex-row justify-between items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[#94A3B8] text-xs xs:text-sm">
            &copy; {new Date().getFullYear()} EV Bunker. All rights reserved.
          </p>
          <div className="flex space-x-4 xs:space-x-6 mt-3 xs:mt-4 xs:mt-0">
            <Link href="/privacy" className="text-[#94A3B8] hover:text-[#F1F5F9] text-xs xs:text-sm transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-[#94A3B8] hover:text-[#F1F5F9] text-xs xs:text-sm transition-colors duration-200">
              Terms of Service
            </Link>
          </div>
        </motion.div>
      </div>
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </footer>
  );
};