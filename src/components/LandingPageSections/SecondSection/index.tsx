'use client';

import { motion } from 'framer-motion';

const SecondSection = () => {
  return (
    <motion.section
      className="container flex justify-center items-center h-[100px] min-[500px]:h-[200px] md:h-[400px] mx-auto px-5 lg:px-[115px] mb-12 md:mb-28"
      id="blue-section"
    >
      <div className="-mt-[100px] md:-mt-[200px] max-w-[1100px] absolute">
        <img src="/second.png" alt="ProcStudio clients" />
      </div>
    </motion.section>
  );
};

export default SecondSection;
