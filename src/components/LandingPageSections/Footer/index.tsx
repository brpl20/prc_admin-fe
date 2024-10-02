'use client';

import Image from 'next/image';
import Link from 'next/link';

import { FiFacebook, FiLinkedin, FiYoutube } from 'react-icons/fi';
import { FaInstagram } from 'react-icons/fa';
import { BsTwitterX } from 'react-icons/bs';

const Footer = () => {
  return (
    <footer className="bg-[#1D79FB] p-[60px]">
      <div className="flex flex-col items-center text-center gap-8">
        <div>
          <Image src="/logo-footer.svg" alt="ProcStudio" width={131.4} height={60} />
        </div>

        <div className="text-white">
          <label className="font-bold text-xl">© Procstudio 2024.</label>
          <label className="font-normal text-xl">Todos os direitos reservados.</label>
        </div>

        <div className="flex gap-4">
          <FiFacebook size={24} color="#fff" />
          <FiLinkedin size={24} color="#fff" />
          <FaInstagram size={24} color="#fff" />
          <BsTwitterX size={24} color="#fff" />
          <a href="https://www.youtube.com/@brunopellizzetti" target="_blank" rel="noreferrer">
            <FiYoutube size={24} color="#fff" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
