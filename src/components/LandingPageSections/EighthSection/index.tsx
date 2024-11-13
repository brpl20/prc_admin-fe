'use client';

import { useInView } from 'react-intersection-observer';
import { motion, useAnimation } from 'framer-motion';
import Dropdown from '@/components/Dropdown';

import { useEffect } from 'react';

const EighthSection = () => {
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
    <section
      className="relative bg-white flex items-center justify-center text-center"
      id="blue-section"
    >
      <div className="flex my-[100px] items-center text-center ">
        <motion.section ref={ref} initial={{ opacity: 0, y: 200 }} animate={controls} id="about">
          <div className="flex flex-col w-full items-center text-center gap-12">
            <div className="flex flex-col gap-3">
              <label className="font-bold text-[#0277EE] text-3xl">Perguntas frequentes</label>
            </div>

            <div className="flex justify-center flex-col px-4 lg:px-0">
              <Dropdown
                title="Para que serve o ProcStudio?"
                content="É um sistema de gerenciamento de escritório combinando com a facilidade de gerar documentação jurídica de forma rápida e com qualidade. Nossa intenção é reduzir o uso de papel, automatizar fluxo de tarefas e a fricção entre advogado e cliente no momento da assinatura do contrato."
              />

              <Dropdown
                title="Quanto Custa?"
                content="Ainda não temos um plano específico do ProcStudio, nosso sistema está em fase de teste e implementação, envie um contato para nós para você participar deste time de entusiastas em novas tecnologias e nos ajudar no desenvolvimento dessa ferramenta."
              />

              <Dropdown
                title="Posso colaborar com minha equipe?"
                content="Sim. O ProcStudio é uma ferramenta para uma pequena equipe de advogados, estagiários, paralegais e secretariado. No futuro também teremos integração para advogados externos e parceiros."
              />

              <Dropdown
                title="Posso usar IA no ProcStudio?"
                content="Ainda não, mas estamos desenvolvendo ferramentas que vão ser implementadas com IA em um futuro próximo."
              />

              <Dropdown
                title="Em quais áreas de atuação o ProcStudio pode me ajudar?"
                content="Inicialmente o ProcStudio foi desenvolvido para solucionar as dores do advogado Bruno Pellizzetti, criado por ele mesmo para melhorar rotinas do seu escritório previdenciário, porém é possível que advogados de todas as áreas de atuação se beneficiem com o ProcStudio."
              />
            </div>
          </div>
        </motion.section>
      </div>
    </section>
  );
};

export default EighthSection;
