"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const PaymentSection: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<string>("card");
  
  const paymentMethods = [
    { id: "card", name: "Credit Card", icon: "💳" },
    { id: "paypal", name: "PayPal", icon: "🅿️" },
    { id: "apple", name: "Apple Pay", icon: "🍎" },
    { id: "google", name: "Google Pay", icon: "🇬" },
  ];

  return (
    <Section id="payment" className="bg-gradient-to-br from-[#1E293B] to-[#334155]">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#F1F5F9] mb-4">
            Seamless Payments
          </h2>
          <p className="text-lg text-[#CBD5E1] max-w-2xl mx-auto">
            Secure and convenient payment options for all your charging needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="p-8 border border-[#475569] shadow-[0_0_30px_5px_rgba(16,185,129,0.3)] relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#8B5CF6] opacity-10"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-[#10B981] opacity-10"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-[#F1F5F9] mb-6">Payment Details</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[#CBD5E1] mb-2">Card Number</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="1234 5678 9012 3456" 
                        className="w-full px-4 py-3 bg-[#334155] border border-[#475569] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                      />
                      <div className="absolute right-3 top-3 text-[#94A3B8]">💳</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#CBD5E1] mb-2">Expiry Date</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        className="w-full px-4 py-3 bg-[#334155] border border-[#475569] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#CBD5E1] mb-2">CVV</label>
                      <input 
                        type="text" 
                        placeholder="123" 
                        className="w-full px-4 py-3 bg-[#334155] border border-[#475569] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[#CBD5E1] mb-2">Cardholder Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe" 
                      className="w-full px-4 py-3 bg-[#334155] border border-[#475569] rounded-xl text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                    />
                  </div>
                  
                  <Button className="w-full py-4 mt-4" size="lg" glow>
                    Pay Now
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-[#F1F5F9]">Payment Methods</h3>
              <p className="text-[#CBD5E1]">
                Choose from our secure payment options. All transactions are encrypted and processed securely.
              </p>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <motion.div
                    key={method.id}
                    className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                      selectedMethod === method.id
                        ? "bg-[#334155] border border-[#8B5CF6]/50"
                        : "bg-[#334155] border border-[#475569]/50 hover:border-[#8B5CF6]/50"
                    }`}
                    whileHover={{ x: 10 }}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <span className="text-2xl mr-4">{method.icon}</span>
                    <span className="text-[#F1F5F9] font-medium">{method.name}</span>
                    {selectedMethod === method.id && (
                      <div className="ml-auto text-[#10B981]">✓</div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              <Card className="p-6 mt-8">
                <h4 className="font-bold text-[#F1F5F9] mb-4">Charging Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Energy Consumed</span>
                    <span className="text-[#F1F5F9]">45 kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Time Used</span>
                    <span className="text-[#F1F5F9]">28 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Rate</span>
                    <span className="text-[#F1F5F9]">₹20/kWh</span>
                  </div>
                  <div className="border-t border-[#475569] pt-3 mt-3">
                    <div className="flex justify-between font-bold">
                      <span className="text-[#F1F5F9]">Total</span>
                      <span className="text-[#10B981]">₹900</span>
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