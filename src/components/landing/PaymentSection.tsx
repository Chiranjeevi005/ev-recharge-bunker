"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Section } from '@/components/landing/Section';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

export const PaymentSection: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<string>("card");
  
  const paymentMethods = [
    { id: "card", name: "Credit Card", icon: "💳" },
    { id: "paypal", name: "PayPal", icon: "🅿️" },
    { id: "apple", name: "Apple Pay", icon: "🍎" },
    { id: "google", name: "Google Pay", icon: "🇬" },
  ];

  return (
    <Section id="payment" className="bg-gradient-to-br from-[#1E293B] to-[#334155] section-responsive">
      <div className="container mx-auto">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-responsive-2xl font-bold text-[#F1F5F9] mb-3 sm:mb-4">
            Seamless Payments
          </h2>
          <p className="text-base sm:text-lg text-[#CBD5E1] max-w-2xl mx-auto px-4">
            Secure and convenient payment options for all your charging needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="p-6 sm:p-8 border border-[#475569] shadow-[0_0_20px_3px_rgba(16,185,129,0.3)] sm:shadow-[0_0_30px_5px_rgba(16,185,129,0.3)] relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-[#8B5CF6] opacity-10"></div>
              <div className="absolute -bottom-16 -left-16 w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-[#10B981] opacity-10"></div>
              
              <div className="relative z-10">
                <h3 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] mb-5 sm:mb-6">Payment Details</h3>
                
                <div className="space-y-5 sm:space-y-6">
                  <div>
                    <label className="block text-[#CBD5E1] mb-2 text-sm sm:text-base">Card Number</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="1234 5678 9012 3456" 
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-[#334155] border border-[#475569] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] text-sm sm:text-base"
                      />
                      <div className="absolute right-3 top-2.5 sm:top-3 text-[#94A3B8] text-lg">💳</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-[#CBD5E1] mb-2 text-sm sm:text-base">Expiry Date</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-[#334155] border border-[#475569] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-[#CBD5E1] mb-2 text-sm sm:text-base">CVV</label>
                      <input 
                        type="text" 
                        placeholder="123" 
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-[#334155] border border-[#475569] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[#CBD5E1] mb-2 text-sm sm:text-base">Cardholder Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter cardholder name" 
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-[#334155] border border-[#475569] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] text-sm sm:text-base"
                    />
                  </div>
                  
                  <Button className="w-full py-3 sm:py-4 mt-4" size="md" glow>
                    Pay Now
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-5 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-bold text-[#F1F5F9]">Payment Methods</h3>
              <p className="text-[#CBD5E1] text-sm sm:text-base">
                Choose from our secure payment options. All transactions are encrypted and processed securely.
              </p>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <motion.div
                    key={method.id}
                    className={`flex items-center p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                      selectedMethod === method.id
                        ? "bg-[#334155] border border-[#8B5CF6]/50"
                        : "bg-[#334155] border border-[#475569]/50 hover:border-[#8B5CF6]/50"
                    }`}
                    whileHover={{ x: 5 }}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <span className="text-xl sm:text-2xl mr-3 sm:mr-4">{method.icon}</span>
                    <span className="text-[#F1F5F9] font-medium text-sm sm:text-base">{method.name}</span>
                    {selectedMethod === method.id && (
                      <div className="ml-auto text-[#10B981] text-lg">✓</div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              <Card className="p-5 sm:p-6 mt-6 sm:mt-8">
                <h4 className="font-bold text-[#F1F5F9] mb-3 sm:mb-4 text-base sm:text-lg">Charging Summary</h4>
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8] text-sm">Energy Consumed</span>
                    <span className="text-[#F1F5F9] text-sm">45 kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8] text-sm">Time Used</span>
                    <span className="text-[#F1F5F9] text-sm">28 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8] text-sm">Rate</span>
                    <span className="text-[#F1F5F9] text-sm">₹20/kWh</span>
                  </div>
                  <div className="border-t border-[#475569] pt-2.5 sm:pt-3 mt-2.5 sm:mt-3">
                    <div className="flex justify-between font-bold">
                      <span className="text-[#F1F5F9] text-base">Total</span>
                      <span className="text-[#10B981] text-base">₹900</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
};