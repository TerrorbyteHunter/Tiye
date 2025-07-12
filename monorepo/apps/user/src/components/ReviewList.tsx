import React from 'react';

const ReviewList: React.FC<{ reviews: any[] }> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return <div className="text-gray-500 text-sm">No reviews yet.</div>;
  }
  const avg = (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1);
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold">Average Rating:</span>
        <span className="text-yellow-500 font-bold">{avg}</span>
        <span className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < Math.round(Number(avg)) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
          ))}
        </span>
        <span className="text-gray-500 text-xs">({reviews.length} review{reviews.length > 1 ? 's' : ''})</span>
      </div>
      <div className="space-y-3">
        {reviews.slice(0, 5).map((r, idx) => (
          <div key={r.id || idx} className="border rounded p-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < r.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                ))}
              </span>
              <span className="text-xs text-gray-500">{new Date(r.createdAt || r.created_at).toLocaleDateString('en-GB')}</span>
            </div>
            {r.review && <div className="text-gray-700 text-sm mb-1">{r.review}</div>}
            <div className="text-xs text-gray-400">By User #{r.userId || r.user_id}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList; 