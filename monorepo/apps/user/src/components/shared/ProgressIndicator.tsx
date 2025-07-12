import React from 'react';
import { useLocation } from 'react-router-dom';
import { BackButton } from './BackButton';

export const ProgressIndicator: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const steps = [
    { name: 'Search', path: '/' },
    { name: 'Select Bus', path: '/search' },
    { name: 'Select Seats', path: '/select-seats' },
    { name: 'Checkout', path: '/checkout' },
  ];

  const getCurrentStep = () => {
    if (pathname === '/') return 0;
    if (pathname === '/search') return 1;
    if (pathname.startsWith('/select-seats')) return 2;
    if (pathname === '/checkout') return 3;
    return 0;
  };

  const currentStep = getCurrentStep();

  const isStepComplete = (index: number) => index < currentStep;
  const isCurrentStep = (index: number) => index === currentStep;

  return (
    <div className="w-full bg-white rounded-b-2xl shadow-md border-b border-gray-100 relative overflow-x-auto transition-all duration-300">
      {/* Gradient Bar: background (faded) */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 sm:h-2 z-0 rounded-full"
        style={{ background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)', opacity: 0.12 }}
      />
      {/* Gradient Bar: progress (colored) */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 sm:h-2 z-10 rounded-full transition-all duration-500"
        style={{
          width: `${(currentStep / (steps.length - 1)) * 100}%`,
          background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)',
          opacity: 0.95,
        }}
      />
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 relative z-20">
        <nav className="flex items-center py-1 sm:py-2" aria-label="Progress">
          {/* Redesigned Back Button on the left, only if not on first step */}
          {currentStep > 0 && (
            <div className="flex-shrink-0 mr-2 sm:mr-6 flex items-center h-8 sm:h-12">
              <BackButton
                className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-white/60 shadow-md flex items-center justify-center
                  hover:bg-white/90 hover:shadow-blue-300/60 hover:shadow-lg transition-all duration-200
                  border border-blue-100 text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400
                  !p-0"
                iconOnly
              />
            </div>
          )}
          <ol className="flex flex-row flex-nowrap items-center w-full gap-1 sm:gap-0 overflow-x-auto">
            {steps.map((step, index) => (
              <li key={step.name} className="relative flex-1 min-w-[70px] sm:min-w-0">
                <div className="relative flex flex-col items-center group">
                  <span className="h-8 sm:h-10 flex items-center">
                    <span className={`relative z-10 w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow transition-all duration-300
                      ${isStepComplete(index) ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg' : ''}
                      ${isCurrentStep(index) ? 'border-4 border-blue-500 bg-white text-blue-600 shadow-xl scale-110' : ''}
                      ${!isStepComplete(index) && !isCurrentStep(index) ? 'border-2 border-gray-300 bg-white text-gray-500' : ''}
                    `}>
                      {isStepComplete(index) ? (
                        <svg className="w-4 h-4 sm:w-6 sm:h-6" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className={`text-xs sm:text-base font-bold transition-colors duration-300`}>{index + 1}</span>
                      )}
                    </span>
                  </span>
                  <span className={`text-xs sm:text-sm font-semibold mt-1 sm:mt-2 transition-colors duration-300 ${isCurrentStep(index) ? 'text-blue-700' : 'text-gray-500'}`}>{step.name}</span>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>
      {/* Subtle divider below stepper */}
      <div className="w-full h-2 bg-gradient-to-b from-gray-100/80 to-transparent rounded-b-2xl" />
    </div>
  );
}; 