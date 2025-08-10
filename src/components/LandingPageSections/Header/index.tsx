import Image from 'next/image';
import { useRouter } from 'next/router';
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

        setIsScrolled(scrollY >= blueTop);
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
        className={`left-0 right-0 fixed pt-8 2xl:pt-16 z-50 backdrop-filter 
          ${isScrolled ? 'backdrop-blur-lg' : 'backdrop-blur-sm'} pb-3`}
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-28 flex justify-between relative">
          <div className="flex cursor-pointer left-0 top-0" onClick={() => route.push('/')}>
            <div className="relative h-[47px] w-[140px] sm:w-[260px]">
              <Image
                src={isScrolled ? '/logo-color.png' : '/logo-white.png'}
                alt="ProcStudio"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <button
            onClick={goToLogin}
            className={`
              flex p-2 md:p-0 md:w-48 ${
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
              Acessar{' '}
              <span className="hidden min-[342px]:inline-block">
                o <label className="font-semibold cursor-pointer">Procstudio</label>
              </span>
            </label>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
