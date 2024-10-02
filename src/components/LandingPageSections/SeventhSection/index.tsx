'use client';

import { useInView } from 'react-intersection-observer';
import { motion, useAnimation } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';

import { useEffect } from 'react';

const SeventhSection = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 1 },
      });
    }
  }, [controls, inView]);

  const handleClick = () => {
    window.open(
      'https://api.whatsapp.com/send?phone=5545991313858&text=Ol%C3%A1%2C%20visitei%20o%20site%20do%20ProcStudio%20e%20gostaria%20de%20saber%20mais%20sobre%20o%20sistema.',
      '_blank',
    );
  };

  return (
    <section
      className="relative bg-[#F8F9FA] h-[450px] flex items-center text-center"
      id="blue-section"
    >
      <div className="container mx-auto py-[10px] 2xl:py-[60px] px-[20px] lg:px-[115px]">
        <motion.section
          className="container flex items-center text-center mx-auto px-[20px] lg:px-[115px] mt-[50px] lg:my-[120px]"
          ref={ref}
          initial={{ opacity: 0, y: 200 }}
          animate={controls}
          id="about"
        >
          <div className="flex flex-col items-center text-center gap-12">
            <div className="flex flex-col gap-3">
              <label className="font-bold text-[#0277EE] text-3xl">
                Comece seu teste gratuito hoje!
              </label>
              <label className="font-normal text-2xl text-[#707070]">
                Entre em contato com nosso time e agende uma demonstração gratuita!
              </label>
            </div>

            <button
              className="flex w-[300px] bg-[#0277EE] items-center rounded-md justify-center h-10 cursor-pointer"
              onClick={handleClick}
            >
              <div className="flex gap-1 text-center cursor-pointer items-center">
                <label className="font-normal text-base cursor-pointer text-white">
                  Fale com nosso time de vendas
                </label>

                <div>
                  <FaWhatsapp size={20} className="text-white cursor-pointer" />
                </div>
              </div>
            </button>
          </div>
        </motion.section>
      </div>
    </section>
  );
};

export default SeventhSection;
