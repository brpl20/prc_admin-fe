'use client';

import { useInView } from 'react-intersection-observer';
import { motion, useAnimation } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';

import { useEffect } from 'react';

const FifthSection = () => {
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
      <div className="absolute -z-0 bottom-0">
        <img src="/pointer.svg" alt="Decoração" />
      </div>

      <div className="container mx-auto py-[10px] 2xl:py-[60px] px-[20px] lg:px-[115px]">
        <motion.div className="flex justify-between pt-[100px]">
          <div className="w-[550px] z-10">
            <img src="/fifth.png" alt="ProcStudio for clients" />
          </div>

          <motion.div
            className="z-[2] hidden lg:block mt-11"
            ref={ref}
            initial={{ opacity: 0, y: 200 }}
            animate={controls}
          >
            <div className="flex w-[440px] justify-between ">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col">
                  <label className="font-bold text-xl text-[#0277EE]">
                    Conecte seu escritório, aos seus clientes.
                  </label>
                  <label className="text-[#707070] ml-1">
                    Mantenha seus clientes informados a cada passo do processo e otimize a gestão de
                    seus casos.
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-1">
                    <div>
                      <FaCheckCircle size={20} className="text-[#0277EE] mt-[3px]" />
                    </div>

                    <label className="text-[#0277EE] font-semibold">
                      Transparência total:
                      <label className="text-[#707070] ml-1">
                        Seus clientes acompanham seus casos em tempo real, com acesso seguro a
                        documentos e informações.
                      </label>
                    </label>
                  </div>

                  <div className="flex items-start gap-1">
                    <div>
                      <FaCheckCircle size={20} className="text-[#0277EE] mt-[3px]" />
                    </div>

                    <label className="text-[#0277EE] font-semibold">
                      Colaboração eficiente:
                      <label className="text-[#707070] ml-1">
                        Compartilhe documentos, atribua tarefas e mantenha todos atualizados.
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

export default FifthSection;
