'use client';

import { useInView } from 'react-intersection-observer';
import { motion, useAnimation } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';

import { useEffect } from 'react';

const SixthSection = () => {
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

  return (
    <section className="relative bg-[#1D79FB] pb-10 xl:pb-0 xl:h-[600px] " id="blue-section">
      <div className="absolute hidden xl:block max-w-[600px] h-full -z-0 right-0">
        <img src="/sixth-decoration.png" className="h-full" alt="Decoração" />
      </div>

      <div className="container mx-auto py-[10px] 2xl:py-[60px] px-[20px] lg:px-[115px]">
        <motion.div className="flex justify-between xl:pt-[100px]">
          <motion.div
            className="z-[2] block mt-11"
            ref={ref}
            initial={{ opacity: 0, y: 200 }}
            animate={controls}
          >
            <div className="flex w-full xl:w-[440px] justify-between ">
              <div className="flex flex-col gap-5">
                <label className="font-bold text-center xl:text-left text-2xl xl:text-xl text-white">
                  Elimine todos papéis do seu escritório.
                </label>

                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-1">
                    <div>
                      <FaCheckCircle size={20} className="text-white mt-[3px]" />
                    </div>

                    <label className="text-white font-semibold">
                      Agilidade nos processos:
                      <label className="text-white ml-1 font-normal">
                        Como a digitalização acelera a busca e o compartilhamento de informações.
                      </label>
                    </label>
                  </div>

                  <div className="flex items-start gap-1">
                    <div>
                      <FaCheckCircle size={20} className="text-white mt-[3px]" />
                    </div>

                    <label className="text-white font-semibold">
                      Automatização de tarefas:
                      <label className="text-white ml-1 font-normal">
                        Redução do trabalho manual com a digitalização de documentos e assinatura
                        eletrônica.
                      </label>
                    </label>
                  </div>

                  <div className="flex items-start gap-1">
                    <div>
                      <FaCheckCircle size={20} className="text-white mt-[3px]" />
                    </div>

                    <label className="text-white font-semibold">
                      Melhoria na colaboração:
                      <label className="text-white ml-1 font-normal">
                        Facilidade para equipes trabalharem em conjunto em documentos digitais,
                        independentemente da localização.
                      </label>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="w-[550px] hidden xl:block z-10">
            <img src="/sixh-ilustration.png" alt="ProcStudio offices" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SixthSection;
