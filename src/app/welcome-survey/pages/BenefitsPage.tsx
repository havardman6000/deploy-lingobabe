// src/app/welcome-survey/pages/BenefitsPage.tsx
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import SurveyLayout from '../SurveyLayout';

const BenefitsPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleContinue = () => {
    // Set loading state for transition animation
    setIsLoading(true);
    
    // Simulate loading and check if language selector is ready
    const checkLanguageSelectorReady = () => {
      setTimeout(() => {
        router.push('/language-selector');
      }, 2000);
    };
    
    checkLanguageSelectorReady();
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5FBFF] flex flex-col items-center justify-center">
        <div className="z-20 text-center">
          <div className="w-16 h-16 border-4 border-[#00C853] border-t-transparent rounded-full animate-spin mb-6 mx-auto"></div>
          <h1 className="text-5xl font-semibold text-[#00C853] mb-4">
            Preparing your<br />personalized experience...
          </h1>
          <p className="text-2xl text-gray-600">
            Setting up your language learning journey
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <SurveyLayout>
      <div className="flex-1 flex flex-col items-center w-full px-4 md:px-20 pt-2 md:pt-4 min-h-0">
        <div className="text-center mb-2 md:mb-6">
          <h1 className="text-xl md:text-4xl font-bold font-league-spartan text-[#000000]">
            MASTER THE ART OF CHARM
          </h1>
          <h2 className="text-base md:text-2xl text-[#00C853] font-league-spartan mt-1">
            IN DIFFERENT LANGUAGES!
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-center w-full max-w-[1200px] gap-4 md:gap-12">
          <div className="w-full md:w-[45%] flex justify-center">
            <div className="w-[300px] h-[200px] md:w-[500px] md:h-[350px] relative">
              <Image
                src="/assets/image/onboarding_msg tp_2.png"
                alt="Here's what you can achieve in 3 months or less!"
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </div>
          </div>

          <div className="w-full md:w-[55%] flex justify-center md:justify-start">
            <div className="w-[300px] h-[250px] md:w-[500px] md:h-[350px] relative">
              <Image
                src="/assets/image/onboarding_msg tp_2.1.png"
                alt="Benefits description"
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-[40px] mt-3 md:mt-8 mb-4 md:mb-10">
        <button
          onClick={handleContinue}
          className="w-full max-w-[400px] h-[50px] mx-auto bg-[#00C853] text-white rounded-[10px] flex items-center justify-center text-xl font-semibold hover:bg-[#00B548] transition-colors duration-300 md:max-w-full md:h-[60px] md:rounded-[10px]"
        >
          GET STARTED
        </button>
      </div>
    </SurveyLayout>
  );
};

export default BenefitsPage;