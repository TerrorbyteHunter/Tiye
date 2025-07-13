import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const ReviewList = ({ reviews }) => {
    if (!reviews || reviews.length === 0) {
        return _jsx("div", { className: "text-gray-500 text-sm", children: "No reviews yet." });
    }
    const avg = (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1);
    return (_jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("span", { className: "font-semibold", children: "Average Rating:" }), _jsx("span", { className: "text-yellow-500 font-bold", children: avg }), _jsx("span", { className: "flex gap-0.5", children: Array.from({ length: 5 }).map((_, i) => (_jsx("span", { className: i < Math.round(Number(avg)) ? 'text-yellow-400' : 'text-gray-300', children: "\u2605" }, i))) }), _jsxs("span", { className: "text-gray-500 text-xs", children: ["(", reviews.length, " review", reviews.length > 1 ? 's' : '', ")"] })] }), _jsx("div", { className: "space-y-3", children: reviews.slice(0, 5).map((r, idx) => (_jsxs("div", { className: "border rounded p-3 bg-gray-50", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "flex gap-0.5", children: Array.from({ length: 5 }).map((_, i) => (_jsx("span", { className: i < r.rating ? 'text-yellow-400' : 'text-gray-300', children: "\u2605" }, i))) }), _jsx("span", { className: "text-xs text-gray-500", children: new Date(r.createdAt || r.created_at).toLocaleDateString('en-GB') })] }), r.review && _jsx("div", { className: "text-gray-700 text-sm mb-1", children: r.review }), _jsxs("div", { className: "text-xs text-gray-400", children: ["By User #", r.userId || r.user_id] })] }, r.id || idx))) })] }));
};
export default ReviewList;
