'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useWeb3 } from '@/components/providers/web3-provider';
import { useSurvey } from '@/context/SurveyContext';
import { ResponsiveLandingVideo } from '@/components/ResponsiveLandingVideo';

export default function LandingPage() {
  const router = useRouter();
  const { isConnected } = useWeb3();
  const { surveyData } = useSurvey();
  const [isLoading, setIsLoading] = useState(true);
  const [hasDoneSurvey, setHasDoneSurvey] = useState(false);

  useEffect(() => {
    // Check both survey completion and localStorage
    const surveyCompleted = localStorage.getItem('lingobabe_survey_completed') === 'true';
    const hasSurveyData = Object.keys(surveyData).length > 0;
    
    // Only consider the survey complete if explicitly marked as completed
    setHasDoneSurvey(surveyCompleted);
    setIsLoading(false);
  }, [surveyData]);

  const handleGetStarted = () => {
    if (isConnected) {
      // If connected, go straight to language selector
      router.push('/language-selector');
    } else if (hasDoneSurvey) {
      // If survey is done but not connected, show wallet connection prompt
      router.push('/welcome-survey');
    } else {
      // If neither connected nor surveyed, start with survey
      router.push('/welcome-survey');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <ResponsiveLandingVideo 
        desktopVideo="/tutors/Lingobabe_landing.mp4"
        mobileVideo="/tutors/Lingobabe_landing_mobile.mp4"
      />
      
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-center z-10">
        <button
          onClick={handleGetStarted}
          className="relative overflow-hidden group"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-400 to-emerald-500 opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="relative block px-16 py-4 text-2xl font-semibold text-white rounded-full shadow-lg">
            GET STARTED
          </span>
          
          {/* Subtle animation hints */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-full h-full bg-white opacity-10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </div>
        </button>
        
        {/* Status text beneath button */}
        <p className="mt-4 text-white text-sm bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
          {isConnected ? 
            'Continue to choose your language' :
            hasDoneSurvey ? 
              'Connect your wallet to start learning' :
              'Take a quick survey to get started'
          }
        </p>
      </div>
    </div>
  );
}
//src/app/page.tsx