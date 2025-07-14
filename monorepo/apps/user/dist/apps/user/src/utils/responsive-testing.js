export const testResponsiveBreakpoints = [
    {
        width: 375,
        height: 667,
        name: 'iPhone SE',
        description: 'Small mobile device'
    },
    {
        width: 390,
        height: 844,
        name: 'iPhone 12/13/14',
        description: 'Standard mobile device'
    },
    {
        width: 414,
        height: 896,
        name: 'iPhone 11/XR',
        description: 'Large mobile device'
    },
    {
        width: 768,
        height: 1024,
        name: 'iPad',
        description: 'Tablet portrait'
    },
    {
        width: 1024,
        height: 768,
        name: 'iPad Landscape',
        description: 'Tablet landscape'
    },
    {
        width: 1280,
        height: 720,
        name: 'Laptop',
        description: 'Standard desktop'
    },
    {
        width: 1920,
        height: 1080,
        name: 'Desktop',
        description: 'Large desktop'
    },
    {
        width: 2560,
        height: 1440,
        name: 'Ultra-wide',
        description: 'Ultra-wide desktop'
    }
];
export function simulateScreenSize(width, height) {
    // This function can be used in development to simulate different screen sizes
    if (typeof window !== 'undefined') {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: width,
        });
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: height,
        });
        // Trigger resize event
        window.dispatchEvent(new Event('resize'));
    }
}
export function getCurrentBreakpoint() {
    if (typeof window === 'undefined')
        return null;
    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;
    return testResponsiveBreakpoints.find(breakpoint => breakpoint.width === currentWidth && breakpoint.height === currentHeight) || null;
}
export function logResponsiveInfo() {
    if (typeof window === 'undefined')
        return;
    const currentBreakpoint = getCurrentBreakpoint();
    const responsiveInfo = {
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        userAgent: navigator.userAgent,
        currentBreakpoint
    };
    console.log('📱 Responsive Info:', responsiveInfo);
    return responsiveInfo;
}
