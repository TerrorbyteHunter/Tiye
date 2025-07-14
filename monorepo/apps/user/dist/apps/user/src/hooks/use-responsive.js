import { useState, useEffect } from 'react';
const BREAKPOINTS = {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
    largeDesktop: 1536,
};
export function useResponsive() {
    const [state, setState] = useState({
        isMobile: false,
        isTablet: false,
        isDesktop: false,
        isLargeDesktop: false,
        screenWidth: 0,
        screenHeight: 0,
        orientation: 'portrait',
    });
    useEffect(() => {
        const updateState = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            setState({
                isMobile: width < BREAKPOINTS.mobile,
                isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
                isDesktop: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop,
                isLargeDesktop: width >= BREAKPOINTS.desktop,
                screenWidth: width,
                screenHeight: height,
                orientation: width > height ? 'landscape' : 'portrait',
            });
        };
        updateState();
        window.addEventListener('resize', updateState);
        return () => window.removeEventListener('resize', updateState);
    }, []);
    return state;
}
// Convenience hooks for specific device types
export function useIsMobile() {
    const { isMobile } = useResponsive();
    return isMobile;
}
export function useIsTablet() {
    const { isTablet } = useResponsive();
    return isTablet;
}
export function useIsDesktop() {
    const { isDesktop, isLargeDesktop } = useResponsive();
    return isDesktop || isLargeDesktop;
}
