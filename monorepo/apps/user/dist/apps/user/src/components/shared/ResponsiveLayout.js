import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ResponsiveNavigation } from './ResponsiveNavigation';
import { useResponsive } from '../../hooks/use-responsive';
export function ResponsiveLayout({ children, showNavigation = true, className = '' }) {
    const { isMobile } = useResponsive();
    return (_jsxs("div", { className: `min-h-screen bg-gray-50 ${className}`, children: [showNavigation && !isMobile && (_jsx(ResponsiveNavigation, {})), _jsx("main", { className: `
        ${isMobile ? 'pb-20' : 'pt-16'} // Add bottom padding for mobile nav, top padding for desktop nav
        px-4 sm:px-6 lg:px-8
        py-4 sm:py-6 lg:py-8
      `, children: children }), showNavigation && isMobile && (_jsx(ResponsiveNavigation, {}))] }));
}
// Specialized layout components
export function MobileLayout({ children, className = '' }) {
    const { isMobile } = useResponsive();
    if (!isMobile)
        return null;
    return (_jsxs("div", { className: `min-h-screen bg-gray-50 pb-20 ${className}`, children: [_jsx("main", { className: "px-4 py-4", children: children }), _jsx(ResponsiveNavigation, {})] }));
}
export function DesktopLayout({ children, className = '' }) {
    const { isDesktop } = useResponsive();
    if (!isDesktop)
        return null;
    return (_jsxs("div", { className: `min-h-screen bg-gray-50 ${className}`, children: [_jsx(ResponsiveNavigation, {}), _jsx("main", { className: "pt-16 px-6 lg:px-8 py-6 lg:py-8", children: children })] }));
}
