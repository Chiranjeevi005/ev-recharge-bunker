"use client";

import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

const SecurityPage = () => {
  return (
    <div className="min-h-screen bg-[#1E293B]">
      <Navbar />
      
      <div className="pt-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Security Statement</h1>
          <p className="text-lg text-[#94A3B8]">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="bg-[#1E293B]/50 backdrop-blur-xl border border-[#334155] rounded-2xl p-6 md:p-8">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">1. Our Commitment to Security</h2>
            <p className="text-[#94A3B8] mb-4">
              At EV Bunker, we take the security of our users' data and transactions seriously. We implement industry-standard security measures to protect your information from unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">2. Data Encryption</h2>
            <p className="text-[#94A3B8] mb-4">
              All data transmitted between your device and our servers is encrypted using TLS (Transport Layer Security) protocol. Sensitive information such as passwords and payment details are encrypted at rest using advanced encryption standards.
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">3. Payment Security</h2>
            <p className="text-[#94A3B8] mb-4">
              We use trusted third-party payment processors that comply with PCI DSS (Payment Card Industry Data Security Standard) requirements. We never store your complete payment card information on our servers.
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">4. Authentication and Access Control</h2>
            <p className="text-[#94A3B8] mb-4">
              We implement robust authentication mechanisms including:
            </p>
            <ul className="list-disc list-inside text-[#94A3B8] space-y-2 ml-4">
              <li>Secure password hashing</li>
              <li>Two-factor authentication (2FA) options</li>
              <li>Session management and timeout controls</li>
              <li>Role-based access controls for administrative functions</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">5. Infrastructure Security</h2>
            <p className="text-[#94A3B8] mb-4">
              Our infrastructure security measures include:
            </p>
            <ul className="list-disc list-inside text-[#94A3B8] space-y-2 ml-4">
              <li>Regular security audits and penetration testing</li>
              <li>Firewall protection and intrusion detection systems</li>
              <li>DDoS protection and mitigation</li>
              <li>Automated security monitoring and alerting</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">6. Incident Response</h2>
            <p className="text-[#94A3B8] mb-4">
              We maintain an incident response plan to quickly address any security events:
            </p>
            <ul className="list-disc list-inside text-[#94A3B8] space-y-2 ml-4">
              <li>24/7 monitoring of security events</li>
              <li>Immediate containment and investigation procedures</li>
              <li>Notification to affected users when required</li>
              <li>Post-incident analysis and improvement measures</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Reporting Security Issues</h2>
            <p className="text-[#94A3B8] mb-4">
              If you discover a security vulnerability in our services, please report it to us immediately at:
            </p>
            <p className="text-[#94A3B8]">
              Email: security@evbunker.com<br />
              PGP Key: Available upon request
            </p>
            <p className="text-[#94A3B8] mt-4">
              We appreciate responsible disclosure and will work with you to address any issues promptly.
            </p>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SecurityPage;