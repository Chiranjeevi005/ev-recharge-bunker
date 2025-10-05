"use client";

import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-[#1E293B]">
      <Navbar />
      
      <div className="pt-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-lg text-[#94A3B8]">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="bg-[#1E293B]/50 backdrop-blur-xl border border-[#334155] rounded-2xl p-6 md:p-8">
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-[#94A3B8] mb-4">
              By accessing or using the EV Bunker services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">2. Service Description</h2>
            <p className="text-[#94A3B8] mb-4">
              EV Bunker provides a platform for locating and booking electric vehicle charging stations. Our services include but are not limited to:
            </p>
            <ul className="list-disc list-inside text-[#94A3B8] space-y-2 ml-4">
              <li>Real-time charging station availability information</li>
              <li>Online booking and payment processing</li>
              <li>Account management and user profiles</li>
              <li>Customer support and communication</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">3. User Responsibilities</h2>
            <p className="text-[#94A3B8] mb-4">
              As a user of our services, you agree to:
            </p>
            <ul className="list-disc list-inside text-[#94A3B8] space-y-2 ml-4">
              <li>Provide accurate and complete information when creating an account</li>
              <li>Maintain the security of your account credentials</li>
              <li>Use the services only for lawful purposes</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not interfere with or disrupt the services or servers</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">4. Payment Terms</h2>
            <p className="text-[#94A3B8] mb-4">
              All payments for booking services are processed through our secure payment gateway. By using our services, you agree to:
            </p>
            <ul className="list-disc list-inside text-[#94A3B8] space-y-2 ml-4">
              <li>Pay all fees and charges associated with your bookings</li>
              <li>Provide valid payment information</li>
              <li>Accept responsibility for all transactions conducted through your account</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">5. Limitation of Liability</h2>
            <p className="text-[#94A3B8] mb-4">
              EV Bunker shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages resulting from:
            </p>
            <ul className="list-disc list-inside text-[#94A3B8] space-y-2 ml-4">
              <li>The use or inability to use our services</li>
              <li>Unauthorized access to or alteration of your data</li>
              <li>Statements or conduct of any third party on the service</li>
              <li>Any other matter relating to the service</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">6. Changes to Terms</h2>
            <p className="text-[#94A3B8] mb-4">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the services after any such changes constitutes your acceptance of the new Terms of Service.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Contact Information</h2>
            <p className="text-[#94A3B8] mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-[#94A3B8]">
              Email: legal@evbunker.com<br />
              Address: EV Bunker, Bangalore, India
            </p>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TermsPage;