"use client";

import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-[#1E293B]">
      <Navbar />
      
      <div className="pt-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-lg text-[#94A3B8]">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="bg-[#1E293B]/50 backdrop-blur-xl border border-[#334155] rounded-2xl p-6 md:p-8">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p className="text-[#94A3B8] mb-4">
              We collect information to provide better services to all our users. The types of information we collect include:
            </p>
            <h3 className="text-xl font-semibold text-white mb-3">Personal Information</h3>
            <ul className="list-disc list-inside text-[#94A3B8] space-y-2 ml-4 mb-4">
              <li>Name and contact information</li>
              <li>Email address and phone number</li>
              <li>Payment information</li>
              <li>Vehicle information</li>
              <li>Account credentials</li>
            </ul>
            <h3 className="text-xl font-semibold text-white mb-3">Usage Information</h3>
            <ul className="list-disc list-inside text-[#94A3B8] space-y-2 ml-4">
              <li>Device information and IP address</li>
              <li>Browsing history and interactions with our services</li>
              <li>Location data (with your permission)</li>
              <li>Charging session data and preferences</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Information</h2>
            <p className="text-[#94A3B8] mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-[#94A3B8] space-y-2 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and security alerts</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze usage patterns</li>
              <li>Personalize your experience</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">3. Information Sharing</h2>
            <p className="text-[#94A3B8] mb-4">
              We do not sell, trade, or otherwise transfer your personal information to outside parties except in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-[#94A3B8] space-y-2 ml-4">
              <li>With your consent</li>
              <li>With trusted third-party service providers who assist us in operating our services</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights, privacy, safety, or property</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
            <p className="text-[#94A3B8] mb-4">
              We implement a variety of security measures to maintain the safety of your personal information. These include:
            </p>
            <ul className="list-disc list-inside text-[#94A3B8] space-y-2 ml-4">
              <li>Encryption of sensitive data</li>
              <li>Secure server infrastructure</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">5. Your Rights</h2>
            <p className="text-[#94A3B8] mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-[#94A3B8] space-y-2 ml-4">
              <li>Access and update your personal information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Restrict or object to certain processing of your data</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">6. Cookies and Tracking Technologies</h2>
            <p className="text-[#94A3B8] mb-4">
              We use cookies and similar tracking technologies to enhance your experience and analyze usage patterns. You can control cookies through your browser settings.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Contact Us</h2>
            <p className="text-[#94A3B8] mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-[#94A3B8]">
              Email: privacy@evbunker.com<br />
              Address: EV Bunker, Bangalore, India
            </p>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrivacyPage;