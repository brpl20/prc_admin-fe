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
import PlansSection from '@/components/LandingPageSections/PlansSection';

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
      <PlansSection />
      <EighthSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
