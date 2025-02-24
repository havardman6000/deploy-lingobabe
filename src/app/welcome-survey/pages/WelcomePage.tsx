import React from 'react';
import Image from 'next/image';
import ContinueButton from '../ContinueButton';
import SurveyLayout from '../SurveyLayout';

const WelcomePage = () => {
  return (
    <SurveyLayout>
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4">
        <div className="relative max-w-[600px] w-full mx-auto flex flex-col items-center">
          <Image
            src="/assets/image/onboarding msg_1.jpg"
            alt="Virtual Date Welcome Message"
            width={600}
            height={400}
            className="w-auto h-auto"
            priority
            unoptimized
          />
        </div>
      </div>
      <div className="w-full px-4 md:px-[40px] mb-8 md:mb-14">
        <div className="max-w-[400px] md:max-w-none mx-auto">
          <ContinueButton onClick={() => {}} nextPage="/welcome-survey/language-selection" />
        </div>
      </div>
    </SurveyLayout>
  );
};

export default WelcomePage;
