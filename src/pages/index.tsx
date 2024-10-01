'use client';

import {
  Header,
  FirstSection,
  SecondSection,
  ThirdSection,
  FourthSection,
} from '@/components/LandingPageSections';

const LandingPage = () => {
  return (
    <div className="bg-white">
      <Header />
      <FirstSection />
      <SecondSection />
      <ThirdSection />
      <FourthSection />
    </div>
  );
};

export default LandingPage;
