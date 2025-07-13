import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const LoadingSpinner = ({ size = 'medium', fullScreen = false, text, }) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12',
    };
    const spinner = (_jsxs("div", { className: "flex flex-col items-center justify-center", children: [_jsx("div", { className: `${sizeClasses[size]} animate-spin rounded-full border-4 border-blue-600 border-t-transparent` }), text && _jsx("p", { className: "mt-2 text-gray-600", children: text })] }));
    if (fullScreen) {
        return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: spinner }));
    }
    return spinner;
};
export default LoadingSpinner;
