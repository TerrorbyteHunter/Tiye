import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ResponsiveWrapper } from './ResponsiveWrapper';
export function ResponsiveDataDisplay({ data, title, className = '', onItemClick }) {
    return (_jsxs("div", { className: className, children: [title && (_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: title })), _jsx(ResponsiveWrapper, { mobile: _jsx(MobileDataCards, { data: data, onItemClick: onItemClick }), desktop: _jsx(DesktopDataTable, { data: data, onItemClick: onItemClick }) })] }));
}
function MobileDataCards({ data, onItemClick }) {
    return (_jsx("div", { className: "space-y-4", children: data.map((item) => (_jsxs("div", { onClick: () => onItemClick?.(item), className: "bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("h3", { className: "font-semibold text-gray-900 text-sm", children: item.title }), item.status && (_jsx("span", { className: `
                px-2 py-1 rounded-full text-xs font-medium
                ${item.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                ${item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${item.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
              `, children: item.status }))] }), item.description && (_jsx("p", { className: "text-gray-600 text-sm mb-2", children: item.description })), _jsxs("div", { className: "flex justify-between items-center text-xs text-gray-500", children: [item.date && _jsx("span", { children: item.date }), item.price && _jsx("span", { className: "font-semibold text-green-600", children: item.price })] })] }, item.id))) }));
}
function DesktopDataTable({ data, onItemClick }) {
    return (_jsx("div", { className: "bg-white shadow-sm rounded-lg overflow-hidden", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Title" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Description" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Date" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Price" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: data.map((item) => (_jsxs("tr", { onClick: () => onItemClick?.(item), className: "hover:bg-gray-50 cursor-pointer transition-colors", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: item.title }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: item.description || '-' }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: item.status && (_jsx("span", { className: `
                    inline-flex px-2 py-1 text-xs font-semibold rounded-full
                    ${item.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                    ${item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${item.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                  `, children: item.status })) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: item.date || '-' }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600", children: item.price || '-' })] }, item.id))) })] }) }));
}
