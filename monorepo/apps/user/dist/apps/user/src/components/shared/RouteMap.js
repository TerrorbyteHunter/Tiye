import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect, useState } from 'react';
export const RouteMap = ({ from, to, stops }) => {
    const iconRefs = useRef([]);
    const containerRef = useRef(null);
    const [lineDims, setLineDims] = useState({ top: 0, height: 0 });
    // All points: start, stops, end
    const points = [
        { type: 'start', name: from, label: 'Starting Point', color: 'blue', icon: (_jsxs("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "2" }), _jsx("circle", { cx: "12", cy: "12", r: "4", fill: "currentColor" })] })) },
        ...stops.map(stop => ({ type: 'stop', name: stop.name, label: '', color: 'blue', icon: (_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "2" }) })) })),
        { type: 'end', name: to, label: 'Final Destination', color: 'green', icon: (_jsxs("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("rect", { x: "4", y: "4", width: "16", height: "16", rx: "8", stroke: "currentColor", strokeWidth: "2" }), _jsx("rect", { x: "8", y: "8", width: "8", height: "8", rx: "4", fill: "currentColor" })] })) },
    ];
    useEffect(() => {
        if (iconRefs.current.length > 1 && containerRef.current) {
            const first = iconRefs.current[0];
            const last = iconRefs.current[iconRefs.current.length - 1];
            if (first && last) {
                const top = first.offsetTop + first.offsetHeight / 2;
                const bottom = last.offsetTop + last.offsetHeight / 2;
                setLineDims({ top, height: bottom - top });
            }
        }
    }, [points.length]);
    return (_jsxs("div", { className: "bg-white rounded-xl shadow-lg p-3 sm:p-6", children: [_jsxs("h3", { className: "text-base sm:text-lg font-bold mb-3 sm:mb-6 text-blue-700 flex items-center gap-2", children: [_jsxs("svg", { className: "w-4 h-4 sm:w-6 sm:h-6 text-blue-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 12v.01" })] }), "Route Map"] }), _jsxs("div", { className: "flex", ref: containerRef, children: [_jsxs("div", { className: "relative flex flex-col items-center", style: { width: 32 }, children: [_jsx("div", { className: "absolute left-1/2 -translate-x-1/2 w-0.5 sm:w-1 bg-gradient-to-b from-blue-600 via-blue-400 to-green-500 z-0 rounded", style: { top: lineDims.top, height: lineDims.height } }), points.map((point, idx) => (_jsx("div", { ref: el => (iconRefs.current[idx] = el), className: `w-5 h-5 sm:w-8 sm:h-8 flex items-center justify-center rounded-full shadow-lg z-10 mb-3 sm:mb-6 ${point.type === 'start' ? 'bg-blue-600 text-white border-2 sm:border-4 border-white' :
                                    point.type === 'end' ? 'bg-green-500 text-white border-2 sm:border-4 border-white' :
                                        'bg-white border sm:border-2 border-blue-400 text-blue-600'}`, children: point.icon }, idx)))] }), _jsx("div", { className: "flex flex-col gap-2 sm:gap-6 ml-2 sm:ml-4 flex-1", children: points.map((point, idx) => (_jsxs("div", { className: "flex items-center h-5 sm:h-8", children: [point.type === 'start' && (_jsxs("div", { className: "bg-blue-50 rounded-lg p-2 sm:p-4 shadow-sm min-w-[90px] sm:min-w-[140px]", children: [_jsx("p", { className: "font-semibold text-xs sm:text-base text-blue-700", children: point.name }), _jsx("p", { className: "text-[10px] sm:text-sm text-gray-500", children: point.label })] })), point.type === 'stop' && (_jsx("div", { className: "bg-gray-50 rounded-lg p-2 sm:p-4 shadow-sm min-w-[90px] sm:min-w-[140px]", children: _jsx("p", { className: "font-medium text-xs sm:text-base text-gray-700", children: point.name }) })), point.type === 'end' && (_jsxs("div", { className: "bg-green-50 rounded-lg p-2 sm:p-4 shadow-sm min-w-[90px] sm:min-w-[140px]", children: [_jsx("p", { className: "font-semibold text-xs sm:text-base text-green-700", children: point.name }), _jsx("p", { className: "text-[10px] sm:text-sm text-gray-500", children: point.label })] }))] }, idx))) })] })] }));
};
