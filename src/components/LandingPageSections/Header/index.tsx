'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const Header = () => {
  const route = useRouter();

  const [isScrolled, setIsScrolled] = useState(false);

  const goToLogin = () => {
    route.push('/login');
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;

      const blueSection = document.getElementById('blue-section');

      if (blueSection) {
        const blueTop = blueSection.offsetTop - 80;

        if (scrollY >= blueTop) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header>
      <nav
        className={`left-0 right-0 fixed pt-[30px] 2xl:pt-[60px] z-50 backdrop-filter 
          ${isScrolled ? 'backdrop-blur-lg' : 'backdrop-blur-sm'} pb-[10px]`}
      >
        <div className="container mx-auto px-[20px] lg:px-[115px] flex justify-between relative">
          <div
            className="flex gap-[12px] cursor-pointer left-0 top-0"
            onClick={() => route.push('/')}
          >
            {isScrolled ? (
              <Image src="/logo-color.png" alt="ProcStudio" width={260} height={47} />
            ) : (
              <Image src="/logo-white.png" alt="ProcStudio" width={260} height={47} />
            )}
          </div>

          <button
            onClick={goToLogin}
            className={`
              flex w-[191px] ${
                isScrolled ? 'bg-[#0277EE]' : 'bg-white'
              }  items-center rounded-md justify-center h-10 cursor-pointer
              `}
            name="menu"
            aria-label="menu"
            aria-labelledby="menu"
          >
            <label
              className={`${
                isScrolled ? 'text-white' : 'text-[#0277EE]'
              } cursor-pointer font-medium`}
            >
              Acessar o <label className="font-semibold cursor-pointer">Procstudio</label>
            </label>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
