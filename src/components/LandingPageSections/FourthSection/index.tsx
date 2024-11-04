'use client';

import { useInView } from 'react-intersection-observer';
import { motion, useAnimation } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';

import { useEffect } from 'react';

const FourthSection = () => {
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
    <section className="relative bg-white h-[600px] " id="blue-section">
      <div className="absolute -z-0 top-0 right-0">
        <img src="/pointer.svg" alt="Decoração" />
      </div>

      <div className="container mx-auto py-[10px] 2xl:py-[60px] px-[20px] lg:px-[115px]">
        <motion.div className="flex justify-between pt-[100px]">
          <motion.div
            className="z-[2] hidden lg:block mt-11"
            ref={ref}
            initial={{ opacity: 0, y: 200 }}
            animate={controls}
          >
            <div className="flex w-[440px] justify-between ">
              <div className="flex flex-col gap-5">
                <label className="font-bold text-xl text-[#0277EE]">
                  Proteja seus dados e garanta a conformidade com as normas jurídicas.
                </label>

                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-1">
                    <div>
                      <FaCheckCircle size={20} className="text-[#0277EE] mt-[3px]" />
                    </div>

                    <label className="text-[#0277EE] font-semibold">
                      Segurança de dados:
                      <label className="text-[#707070] ml-1">
                        Proteja os dados dos seus clientes com as mais modernas tecnologias de
                        segurança.
                      </label>
                    </label>
                  </div>

                  <div className="flex items-start gap-1">
                    <div>
                      <FaCheckCircle size={20} className="text-[#0277EE] mt-[3px]" />
                    </div>

                    <label className="text-[#0277EE] font-semibold">
                      Conformidade legal:
                      <label className="text-[#707070] ml-1">
                        Garanta que seu escritório esteja em conformidade com as normas e
                        regulamentações.
                      </label>
                    </label>
                  </div>

                  <div className="flex items-start gap-1">
                    <div>
                      <FaCheckCircle size={20} className="text-[#0277EE] mt-[3px]" />
                    </div>

                    <label className="text-[#0277EE] font-semibold">
                      Auditoria:
                      <label className="text-[#707070] ml-1">
                        Gere relatórios detalhados para acompanhar o cumprimento das normas e
                        regulamentações.
                      </label>
                    </label>
                  </div>

                  <div className="flex items-start gap-1">
                    <div>
                      <FaCheckCircle size={20} className="text-[#0277EE] mt-[3px]" />
                    </div>

                    <label className="text-[#0277EE] font-semibold">
                      Backup:
                      <label className="text-[#707070] ml-1">
                        Tenha a garantia de que seus dados estão seguros com nosso sistema de
                        backup.
                      </label>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="w-[550px] z-10">
            <img src="/four.png" alt="ProcStudio offices" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FourthSection;
