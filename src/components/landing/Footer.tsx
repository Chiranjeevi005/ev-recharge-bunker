"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const Footer: React.FC = () => {
  const navigation = {
    product: [
      { name: 'Features', href: '#' },
      { name: 'Cities', href: '#' },
      { name: 'Pricing', href: '#' },
      { name: 'Demo', href: '#' },
    ],
    company: [
      { name: 'About', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy', href: '#' },
      { name: 'Terms', href: '#' },
      { name: 'Security', href: '#' },
    ],
  };

  return (
    <footer className="bg-[#1E293B] border-t border-[#334155]">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-12">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#10B981] to-[#059669] mb-3 sm:mb-4">
                EV Bunker
              </h2>
              <p className="text-[#94A3B8] mb-5 sm:mb-6 max-w-md text-sm sm:text-base">
                Revolutionizing electric vehicle charging with a seamless, futuristic experience. 
                Powering the future of sustainable transportation.
              </p>
            </motion.div>
          </div>
          
          {Object.entries(navigation).map(([category, links], categoryIndex) => (
            <div key={category} className="sm:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              >
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-[#F1F5F9] capitalize">{category}</h3>
                <ul className="space-y-2 sm:space-y-3">
                  {links.map((link, linkIndex) => (
                    <motion.li 
                      key={link.name}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <a 
                        href={link.href} 
                        className="text-[#94A3B8] hover:text-[#F1F5F9] transition-colors duration-200 text-sm sm:text-base"
                      >
                        {link.name}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          ))}
        </div>
        
        <motion.div 
          className="border-t border-[#334155] mt-10 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[#94A3B8] text-sm">
            &copy; {new Date().getFullYear()} EV Bunker. All rights reserved.
          </p>
          <div className="flex space-x-4 sm:space-x-6 mt-3 sm:mt-0">
            <a href="#" className="text-[#94A3B8] hover:text-[#F1F5F9] text-sm transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="#" className="text-[#94A3B8] hover:text-[#F1F5F9] text-sm transition-colors duration-200">
              Terms of Service
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};