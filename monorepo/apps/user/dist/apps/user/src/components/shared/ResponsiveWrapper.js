import { jsx as _jsx } from "react/jsx-runtime";
import { useResponsive } from '../../hooks/use-responsive';
export function ResponsiveWrapper({ mobile, desktop, tablet, className = '', fallback }) {
    const { isMobile, isTablet, isDesktop } = useResponsive();
    // Show loading state while determining screen size
    if (!isMobile && !isTablet && !isDesktop) {
        return fallback ? _jsx("div", { className: className, children: fallback }) : null;
    }
    if (isMobile) {
        return _jsx("div", { className: className, children: mobile });
    }
    if (isTablet && tablet) {
        return _jsx("div", { className: className, children: tablet });
    }
    return _jsx("div", { className: className, children: desktop });
}
// Specialized wrappers for common patterns
export function MobileOnly({ children, className = '' }) {
    const { isMobile } = useResponsive();
    return isMobile ? _jsx("div", { className: className, children: children }) : null;
}
export function DesktopOnly({ children, className = '' }) {
    const { isDesktop } = useResponsive();
    return isDesktop ? _jsx("div", { className: className, children: children }) : null;
}
export function TabletAndUp({ children, className = '' }) {
    const { isTablet, isDesktop } = useResponsive();
    return (isTablet || isDesktop) ? _jsx("div", { className: className, children: children }) : null;
}
