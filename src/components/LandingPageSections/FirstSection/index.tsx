'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

const FirstSection = () => {
  const controls = useAnimation();
  const imageControls = useAnimation();

  useEffect(() => {
    controls.start({ opacity: 1, x: 0, transition: { duration: 0.6 } });
    imageControls.start({ opacity: 1, x: 0, transition: { duration: 0.6 } });
  }, [controls, imageControls]);

  return (
    <section
      className="h-screen min-h-[1000px] min-[340px]:min-h-[950px] sm:min-h-[720px] firstSection overflow-hidden"
      id="home"
    >
      <>
        <div
          className="absolute inset-0 w-full min-h-[920px] sm:min-h-[720px] bg-cover bg-center"
          style={{ backgroundImage: "url('/background-firstSection.png')" }}
        />

        <div className="absolute inset-0 min-h-[920px] sm:min-h-[720px] bg-[#0277EE] opacity-[0.88]" />

        <div className="absolute top-0 right-20">
          <img src="/login.svg" alt="Login Decoração" />
        </div>
        <div className="absolute bottom-0 left-20">
          <img src="/login.svg" alt="Login Decoração" />
        </div>
      </>

      <div className="container mx-auto py-[10px] 2xl:py-[60px] px-[20px] lg:px-[115px]">
        <motion.div className="flex flex-col items-center justify-between relative pt-24 sm:pt-40">
          <motion.div
            className="flex flex-col text-center justify-between"
            initial={{
              opacity: 0,
              x: -100,
            }}
            animate={controls}
          >
            <span className="font-semibold mb-5 text-[40px] text-white leading-tight">
              Eleve sua advocacia com a gestão inteligente de processos jurídicos.
            </span>

            <>
              <span className="font-semibold text-[20px] mb-[4px] text-white leading-tight">
                Diga adeus às planilhas e papéis!
              </span>

              <span className="font-normal text-[20px] text-white leading-[26px]">
                Diga adeus às planilhas e papéis! Nosso sistema transforma a forma como você
                gerencia seus casos. Automatize tarefas, centralize informações e ganhe mais tempo
                para focar no que realmente importa: seus clientes.
              </span>
            </>
          </motion.div>

          <motion.div
            className="z-[2] lg:block mt-11"
            initial={{ opacity: 0, x: 100 }}
            animate={imageControls}
          >
            <div className="flex flex-col sm:flex-row gap-5">
              <button
                className="flex text-lg px-4 py-[5px] bg-white items-center rounded-md justify-center cursor-pointer"
                name="menu"
                aria-label="menu"
                aria-labelledby="menu"
              >
                <label className="text-[#0277EE] cursor-pointer font-medium">
                  Conheça nossa ferramenta
                </label>
              </button>

              <button
                className="flex text-lg px-4 py-[5px] bg-transparent items-center rounded-md justify-center cursor-pointer border-2 border-white"
                name="menu"
                aria-label="menu"
                aria-labelledby="menu"
              >
                <label className="text-white cursor-pointer font-medium">
                  Conheça nossos planos
                </label>
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FirstSection;
