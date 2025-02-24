import React, { useState } from 'react';
import Image from 'next/image';
import SurveyLayout from '../SurveyLayout';

const PaymentPage = () => {
  const [isEnabled, setIsEnabled] = useState(true);

  return (
    <SurveyLayout>
      <div className="relative flex-1 flex flex-col items-center w-full">
        {/* Cloud Background */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/assets/image/onboarding_payment_clouds.jpg"
            alt="Background clouds"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content Container */}
        <div className="relative flex flex-col items-center w-full px-4 md:px-20 z-10 pt-4 md:pt-4">
          {/* Title */}
          <div className="text-center mb-1 md:mb-1">
            <h1 className="text-lg md:text-3xl font-bold font-league-spartan text-[#000000]">FREE FULL ACCESS TO</h1>
            <h2 className="text-base md:text-2xl text-[#00C853] font-league-spartan font-bold">LINGOBABE PLUS</h2>
          </div>

          {/* Trial Info Cards */}
          <div className="w-full max-w-[450px] flex justify-center mb-2 md:mb-3">
            <div className="w-[280px] h-[280px] md:w-[350px] md:h-[280px] relative -mt-2 md:-mt-2">
              <Image
                src="/assets/image/payment_1.1.jpg"
                alt="Trial period information"
                fill
                className="object-contain object-center"
                priority
                unoptimized
              />
            </div>
          </div>

          {/* Toggle Section */}
          <div className="w-full max-w-[280px] md:max-w-[350px] relative mb-2 md:mb-3 -mt-4 md:-mt-3">
            {/* Background Image */}
            <div className="w-full h-[42px] md:h-[52px] relative">
              <Image
                src="/assets/image/trial reminder.jpg"
                alt="Trial reminder enabled"
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </div>
            
            {/* Toggle Button Overlay */}
            <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2">
              <button
                onClick={() => setIsEnabled(!isEnabled)}
                className={`w-10 h-5 md:w-12 md:h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  isEnabled ? 'bg-[#FF9500]' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-3 h-3 md:w-4 md:h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    isEnabled ? 'translate-x-5 md:translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Bottom Text and Button */}
          <div className="w-full max-w-[450px] flex flex-col items-center -mt-2">
            <div className="w-[380px] h-[120px] md:w-[450px] md:h-[130px] relative mb-3 md:mb-4">
              <Image
                src="/assets/image/payment_1.2.jpg"
                alt="Trial information and cancellation details"
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </div>

            {/* Start Trial Button */}
            <button className="w-full max-w-[280px] md:max-w-[600px] h-[42px] md:h-[52px] bg-[#00C853] text-white font-league-spartan text-base md:text-2xl font-bold rounded-[10px] hover:bg-opacity-90 transition-colors shadow-lg mb-1">
              START YOUR FREE TRIAL!
            </button>

            {/* No Payment Text */}
            <p className="text-[#000000] font-league-spartan text-xs md:text-lg font-bold">
              NO PAYMENT NOW!
            </p>
          </div>
        </div>
      </div>
    </SurveyLayout>
  );
};

export default PaymentPage; 