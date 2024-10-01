'use client';

import { motion } from 'framer-motion';

const SecondSection = () => {
  return (
    <motion.section
      className="container flex justify-center items-center h-[400px] mx-auto px-[20px] lg:px-[115px] mb-[120px]"
      id="blue-section"
    >
      <div className="mt-[-200px] absolute">
        <img src="/second-img.png" alt="ProcStudio clients" />
      </div>
    </motion.section>
  );
};

export default SecondSection;
