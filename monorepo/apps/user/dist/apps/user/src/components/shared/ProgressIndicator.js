import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLocation } from 'react-router-dom';
import { BackButton } from './BackButton';
export const ProgressIndicator = () => {
    const location = useLocation();
    const pathname = location.pathname;
    const steps = [
        { name: 'Search', path: '/' },
        { name: 'Select Bus', path: '/search' },
        { name: 'Select Seats', path: '/select-seats' },
        { name: 'Checkout', path: '/checkout' },
    ];
    const getCurrentStep = () => {
        if (pathname === '/')
            return 0;
        if (pathname === '/search')
            return 1;
        if (pathname.startsWith('/select-seats'))
            return 2;
        if (pathname === '/checkout')
            return 3;
        return 0;
    };
    const currentStep = getCurrentStep();
    const isStepComplete = (index) => index < currentStep;
    const isCurrentStep = (index) => index === currentStep;
    return (_jsxs("div", { className: "w-full bg-white rounded-b-2xl shadow-md border-b border-gray-100 relative overflow-x-auto transition-all duration-300", children: [_jsx("div", { className: "absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 sm:h-2 z-0 rounded-full", style: { background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)', opacity: 0.12 } }), _jsx("div", { className: "absolute left-0 top-1/2 -translate-y-1/2 h-1.5 sm:h-2 z-10 rounded-full transition-all duration-500", style: {
                    width: `${(currentStep / (steps.length - 1)) * 100}%`,
                    background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)',
                    opacity: 0.95,
                } }), _jsx("div", { className: "max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 relative z-20", children: _jsxs("nav", { className: "flex items-center py-1 sm:py-2", "aria-label": "Progress", children: [currentStep > 0 && (_jsx("div", { className: "flex-shrink-0 mr-2 sm:mr-6 flex items-center h-8 sm:h-12", children: _jsx(BackButton, { className: "w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-white/60 shadow-md flex items-center justify-center\n                  hover:bg-white/90 hover:shadow-blue-300/60 hover:shadow-lg transition-all duration-200\n                  border border-blue-100 text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400\n                  !p-0", iconOnly: true }) })), _jsx("ol", { className: "flex flex-row flex-nowrap items-center w-full gap-1 sm:gap-0 overflow-x-auto", children: steps.map((step, index) => (_jsx("li", { className: "relative flex-1 min-w-[70px] sm:min-w-0", children: _jsxs("div", { className: "relative flex flex-col items-center group", children: [_jsx("span", { className: "h-8 sm:h-10 flex items-center", children: _jsx("span", { className: `relative z-10 w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow transition-all duration-300
                      ${isStepComplete(index) ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg' : ''}
                      ${isCurrentStep(index) ? 'border-4 border-blue-500 bg-white text-blue-600 shadow-xl scale-110' : ''}
                      ${!isStepComplete(index) && !isCurrentStep(index) ? 'border-2 border-gray-300 bg-white text-gray-500' : ''}
                    `, children: isStepComplete(index) ? (_jsx("svg", { className: "w-4 h-4 sm:w-6 sm:h-6", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) })) : (_jsx("span", { className: `text-xs sm:text-base font-bold transition-colors duration-300`, children: index + 1 })) }) }), _jsx("span", { className: `text-xs sm:text-sm font-semibold mt-1 sm:mt-2 transition-colors duration-300 ${isCurrentStep(index) ? 'text-blue-700' : 'text-gray-500'}`, children: step.name })] }) }, step.name))) })] }) }), _jsx("div", { className: "w-full h-2 bg-gradient-to-b from-gray-100/80 to-transparent rounded-b-2xl" })] }));
};
