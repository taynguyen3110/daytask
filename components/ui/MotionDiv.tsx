import { AnimatePresence, motion } from "framer-motion";
import React from "react";

interface MotionDivProps {
  children: React.ReactNode;
  className?: string;
}

const MotionDiv = ({ children, className = "" }: MotionDivProps) => {
  return (
    <AnimatePresence>
      <motion.div
        key={Math.random()} // Unique key to trigger re-animation
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1, ease: "easeInOut" }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default MotionDiv;
