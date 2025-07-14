import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ResponsiveLayout } from '../components/shared/ResponsiveLayout';
import { ResponsiveDataDisplay } from '../components/shared/ResponsiveDataDisplay';
import { ResponsiveWrapper, MobileOnly, DesktopOnly } from '../components/shared/ResponsiveWrapper';
import { useResponsive } from '../hooks/use-responsive';
// Sample data for demonstration
const sampleData = [
    {
        id: '1',
        title: 'Lusaka to Livingstone',
        description: 'Express bus service with AC',
        status: 'active',
        date: '2024-01-15',
        price: 'K250'
    },
    {
        id: '2',
        title: 'Kitwe to Ndola',
        description: 'Regular service with stops',
        status: 'pending',
        date: '2024-01-16',
        price: 'K180'
    },
    {
        id: '3',
        title: 'Chingola to Solwezi',
        description: 'Premium service with WiFi',
        status: 'active',
        date: '2024-01-17',
        price: 'K320'
    },
    {
        id: '4',
        title: 'Kabwe to Chipata',
        description: 'Standard service',
        status: 'cancelled',
        date: '2024-01-18',
        price: 'K200'
    }
];
export default function ResponsiveDemo() {
    const { isMobile, isTablet, isDesktop, screenWidth, screenHeight, orientation } = useResponsive();
    return (_jsx(ResponsiveLayout, { children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-4", children: "Responsive Design Demo" }), _jsx("p", { className: "text-gray-600", children: "This page demonstrates different responsive patterns and components." })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-sm p-6 mb-8", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Current Device Info" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded", children: [_jsx("h3", { className: "font-medium text-gray-900", children: "Screen Size" }), _jsxs("p", { className: "text-sm text-gray-600", children: [screenWidth, " \u00D7 ", screenHeight] })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded", children: [_jsx("h3", { className: "font-medium text-gray-900", children: "Device Type" }), _jsx("p", { className: "text-sm text-gray-600", children: isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop' })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded", children: [_jsx("h3", { className: "font-medium text-gray-900", children: "Orientation" }), _jsx("p", { className: "text-sm text-gray-600 capitalize", children: orientation })] })] })] }), _jsxs("div", { className: "space-y-8", children: [_jsx(MobileOnly, { children: _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-blue-900 mb-2", children: "Mobile Only Content" }), _jsx("p", { className: "text-blue-700 text-sm", children: "This content only appears on mobile devices. Perfect for mobile-specific features like swipe gestures or touch-optimized interfaces." })] }) }), _jsx(DesktopOnly, { children: _jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-green-900 mb-2", children: "Desktop Only Content" }), _jsx("p", { className: "text-green-700 text-sm", children: "This content only appears on desktop devices. Great for complex interfaces that need more screen real estate." })] }) }), _jsx("div", { children: _jsx(ResponsiveDataDisplay, { data: sampleData, title: "Route Information", onItemClick: (item) => console.log('Clicked:', item) }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Responsive Grid Layout" }), _jsx(ResponsiveWrapper, { mobile: _jsx("div", { className: "space-y-4", children: [1, 2, 3, 4].map((i) => (_jsxs("div", { className: "bg-white rounded-lg shadow-sm p-4", children: [_jsxs("h3", { className: "font-semibold", children: ["Card ", i] }), _jsx("p", { className: "text-gray-600 text-sm", children: "Mobile layout - single column" })] }, i))) }), desktop: _jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-6", children: [1, 2, 3, 4].map((i) => (_jsxs("div", { className: "bg-white rounded-lg shadow-sm p-4", children: [_jsxs("h3", { className: "font-semibold", children: ["Card ", i] }), _jsx("p", { className: "text-gray-600 text-sm", children: "Desktop layout - multi-column grid" })] }, i))) }) })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Responsive Form" }), _jsx(ResponsiveWrapper, { mobile: _jsxs("form", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Full Name" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border rounded-md", placeholder: "Enter your full name" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Email" }), _jsx("input", { type: "email", className: "w-full px-3 py-2 border rounded-md", placeholder: "Enter your email" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Phone" }), _jsx("input", { type: "tel", className: "w-full px-3 py-2 border rounded-md", placeholder: "Enter your phone number" })] }), _jsx("button", { type: "submit", className: "w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700", children: "Submit" })] }), desktop: _jsxs("form", { className: "grid grid-cols-2 gap-6", children: [_jsxs("div", { className: "col-span-2", children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Full Name" }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border rounded-md", placeholder: "Enter your full name" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Email" }), _jsx("input", { type: "email", className: "w-full px-3 py-2 border rounded-md", placeholder: "Enter your email" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Phone" }), _jsx("input", { type: "tel", className: "w-full px-3 py-2 border rounded-md", placeholder: "Enter your phone number" })] }), _jsx("div", { className: "col-span-2", children: _jsx("button", { type: "submit", className: "bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700", children: "Submit" }) })] }) })] })] })] }) }));
}
