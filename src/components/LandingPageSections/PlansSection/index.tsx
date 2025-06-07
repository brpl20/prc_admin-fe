'use client';

import { useInView } from 'react-intersection-observer';
import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import PlanCard from './PlanCard';

const PlansSection = () => {
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

  const handleClick = (text: string) => {
    window.open(
      `https://api.whatsapp.com/send?phone=5545991313858&text=${encodeURIComponent(text)}`,
      '_blank',
    );
  };

  return (
    <section className="relative bg-white py-24 px-4 text-center" id="plans-section">
      <motion.div
        className="max-w-7xl mx-auto"
        ref={ref}
        initial={{ opacity: 0, y: 200 }}
        animate={controls}
      >
        <div className="flex flex-col items-center gap-4 mb-12">
          <h2 className="text-3xl font-bold text-blue-600">Nossos planos</h2>
          <p className="text-2xl text-gray-500 max-w-2xl">
            Encontre o melhor plano de acordo com a necessidade do seu escritório.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row justify-center items-center gap-[30px]">
          <PlanCard
            title="Teste"
            subtitle="Testar o ProcStudio"
            price="Free"
            features={[
              'Geração de Documentos',
              'Gestão de Clientes',
              'Gestão de Tarefas',
              'Gestão de Trabalhos',
            ]}
            buttonLabel="Selecionar este plano"
            onClick={() => handleClick('Olá, tudo bem? Gostaria de testar o sistema ProcStudio.')}
          />

          <PlanCard
            title="Iniciante"
            subtitle="Advogado iniciante"
            price="R$ 35"
            features={[
              'Geração de Documentos',
              'Gestão de Clientes',
              'Gestão de Tarefas',
              'Gestão de Trabalhos',
            ]}
            buttonLabel="Selecionar este plano"
            onClick={() =>
              handleClick(
                'Olá, tudo bem? Gostaria de adquirir o plano Iniciante do sistema ProcStudio.',
              )
            }
          />

          <PlanCard
            title="CNPJ"
            subtitle="Advogado com CNPJ"
            price="R$ 70"
            features={[
              'Inclusão de uma sociedade',
              'Acesso de Dois Advogados',
              'Acesso de um membro equipe',
              'Dez Assinaturas Digitais ZapSign',
              'Membros Adicionais  R$ 15,00',
            ]}
            buttonLabel="Selecionar este plano"
            onClick={() =>
              handleClick('Olá, tudo bem? Gostaria de adquirir o plano CNPJ do sistema ProcStudio.')
            }
          />
        </div>
      </motion.div>
    </section>
  );
};

export default PlansSection;
