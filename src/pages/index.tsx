'use client';

import {
  Header,
  FirstSection,
  SecondSection,
  ThirdSection,
  FourthSection,
  FifthSection,
  SixthSection,
  SeventhSection,
  EighthSection,
  Footer,
} from '@/components/LandingPageSections';

const LandingPage = () => {
  return (
    <div className="bg-white">
      <Header />
      <FirstSection />
      <SecondSection />
      <ThirdSection />
      <FourthSection />
      <FifthSection />
      <SixthSection />
      <SeventhSection />
      <EighthSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
