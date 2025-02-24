// src/components/SurveyLayout.tsx (modified)
import React, { ReactNode } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface SurveyLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  showProgressBar?: boolean;
  currentStep?: number;
}

const SurveyLayout: React.FC<SurveyLayoutProps> = ({
  children,
  showBackButton = false,
  showProgressBar = false,
  currentStep = 1,
}) => {
  const router = useRouter();
  const totalSteps = 5;
  const progressWidth = `${(currentStep / totalSteps) * 100}%`;

  return (
    <main className="relative w-full min-h-screen bg-[#F5FBFF] flex flex-col items-center">
      {(showBackButton || showProgressBar) && (
        <div className="w-full px-4 md:px-[40px] pt-4 md:pt-8 flex items-center gap-4">
          {showBackButton && (
            <button
              onClick={() => router.back()}
              className="w-[40px] h-[40px] md:w-[72px] md:h-[72px] flex items-center justify-center"
            >
              <Image
                src="/assets/image/back button.jpg"
                alt="Back"
                width={72}
                height={72}
                className="w-full h-full"
              />
            </button>
          )}
          {showProgressBar && (
            <div className="flex-1 h-3 md:h-4 bg-white rounded-full">
              <div
                className="h-full bg-[#00C853] rounded-full transition-all duration-300"
                style={{ width: progressWidth }}
              />
            </div>
          )}
        </div>
      )}
      {children}
    </main>
  );
};

export default SurveyLayout;