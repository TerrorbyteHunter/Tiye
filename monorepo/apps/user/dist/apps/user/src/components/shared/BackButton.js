import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
export const BackButton = ({ className = '', iconOnly = false }) => {
    const navigate = useNavigate();
    return (_jsxs("button", { onClick: () => navigate(-1), className: `flex items-center text-gray-600 hover:text-blue-600 transition-colors ${className}`, children: [_jsx("svg", { className: "w-5 h-5 mr-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) }), !iconOnly && 'Back'] }));
};
