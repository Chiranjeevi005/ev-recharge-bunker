"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface SectionProps extends HTMLMotionProps<"section"> {
  id?: string;
  className?: string;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  id,
  className = '',
  children,
  ...props
}) => {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className={`py-16 md:py-24 ${className}`}
      {...props}
    >
      {children}
    </motion.section>
  );
};