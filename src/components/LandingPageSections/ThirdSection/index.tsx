'use client';

import { useInView } from 'react-intersection-observer';
import { motion, useAnimation } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';

import { useEffect } from 'react';

const ThirdSection = () => {
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
    <section className="relative bg-[#F8F9FA] h-[600px] " id="blue-section">
      <div className="absolute bottom-0">
        <img src="/pointer.svg" alt="Decoração" />
      </div>

      <div className="container mx-auto py-[10px] 2xl:py-[60px] px-[20px] lg:px-[115px]">
        <motion.div className="flex justify-between pt-[100px]">
          <div className="w-[550px] z-50">
            <img src="/third.png" alt="Decoração" />
          </div>

          <motion.div
            className="z-[2] hidden lg:block mt-11"
            ref={ref}
            initial={{ opacity: 0, y: 200 }}
            animate={controls}
          >
            <div className="flex w-[440px] justify-between ">
              <div className="flex flex-col gap-5">
                <label className="font-bold text-xl text-[#0277EE]">
                  Foco na otimização de processos
                </label>

                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-1">
                    <div>
                      <FaCheckCircle size={20} className="text-[#0277EE] mt-[3px]" />
                    </div>

                    <label className="text-[#0277EE] font-semibold">
                      Aumento da produtividade:
                      <label className="text-[#707070] ml-1">
                        Tenha todos os seus processos em um só lugar, com informações completas e
                        atualizadas.
                      </label>
                    </label>
                  </div>

                  <div className="flex items-start gap-1">
                    <div>
                      <FaCheckCircle size={20} className="text-[#0277EE] mt-[3px]" />
                    </div>

                    <label className="text-[#0277EE] font-semibold">
                      Automatize tarefas:
                      <label className="text-[#707070] ml-1">
                        Elimine tarefas repetitivas e ganhe mais tempo para atender seus clientes.
                      </label>
                    </label>
                  </div>

                  <div className="flex items-start gap-1">
                    <div>
                      <FaCheckCircle size={20} className="text-[#0277EE] mt-[3px]" />
                    </div>

                    <label className="text-[#0277EE] font-semibold">
                      Melhore a comunicação:
                      <label className="text-[#707070] ml-1">
                        Facilite a comunicação com seus clientes e equipe, agilizando o processo.
                      </label>
                    </label>
                  </div>

                  <div className="flex items-start gap-1">
                    <div>
                      <FaCheckCircle size={20} className="text-[#0277EE] mt-[3px]" />
                    </div>

                    <label className="text-[#0277EE] font-semibold">
                      Gere relatórios personalizados:
                      <label className="text-[#707070] ml-1">
                        Tenha insights valiosos sobre o desempenho do seu escritório.
                      </label>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ThirdSection;
