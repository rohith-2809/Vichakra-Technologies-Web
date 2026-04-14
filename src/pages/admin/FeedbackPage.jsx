import { useEffect, useState } from 'react';
import { Star, Eye, EyeOff, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/axios';

function Stars({ rating, size = 13 }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size}
          className={n <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </span>
  );
}

function RatingBar({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-700">{value ?? '—'}/5</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${((value || 0) / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/admin/feedback')
      .then(({ data }) => setFeedback(data.feedback))
      .finally(() => setLoading(false));
  }, []);

  const togglePublic = async (f) => {
    const { data } = await api.patch(`/admin/feedback/${f._id}`, { isPublic: !f.isPublic });
    setFeedback((prev) => prev.map((x) => x._id === data.feedback._id ? data.feedback : x));
  };

  const avg = feedback.length
    ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1)
    : null;

  if (loading) return (
    <div className="space-y-4 animate-pulse max-w-2xl">
      <div className="h-24 bg-white/60 backdrop-blur-md border border-gray-100 rounded-[24px]" />
      {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-white/60 backdrop-blur-md border border-gray-100 rounded-[24px]" />)}
    </div>
  );

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Summary card */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[24px] shadow-sm p-6 flex items-center gap-6">
        <div className="text-center">
          <p className="text-4xl font-bold text-gray-900 tabular-nums">{avg ?? '—'}</p>
          <Stars rating={Math.round(avg)} size={14} />
          <p className="text-xs text-gray-400 mt-1">avg rating</p>
        </div>
        <div className="w-px h-14 bg-gray-100" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-800">{feedback.length} review{feedback.length !== 1 ? 's' : ''}</p>
          <p className="text-xs text-gray-500">{feedback.filter((f) => f.isPublic).length} published · {feedback.filter((f) => !f.isPublic).length} internal</p>
        </div>
      </div>

      {feedback.length === 0 ? (
        <div className="py-16 text-center bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-sm rounded-[24px]">
          <MessageSquare size={24} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">No feedback submitted yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((f, i) => (
            <motion.div
              key={f._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[24px] shadow-sm p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Stars rating={f.rating} size={14} />
                    <span className="text-sm font-bold text-gray-900">{f.rating}/5</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {f.client?.name}
                    {f.client?.company && <> · {f.client.company}</>}
                    {f.project?.title && <> · <span className="text-teal-600">{f.project.title}</span></>}
                  </p>
                </div>
                <button
                  onClick={() => togglePublic(f)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                    f.isPublic
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-teal-300 hover:text-teal-600'
                  }`}
                >
                  {f.isPublic ? <><Eye size={11} /> Published</> : <><EyeOff size={11} /> Internal</>}
                </button>
              </div>

              {/* Breakdown bars */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <RatingBar label="Communication" value={f.communication} />
                <RatingBar label="Quality" value={f.quality} />
                <RatingBar label="Timeliness" value={f.timeliness} />
              </div>

              {f.comments && (
                <blockquote className="border-l-2 border-teal-200 pl-3 text-sm text-gray-600 italic">
                  "{f.comments}"
                </blockquote>
              )}

              <p className="text-[11px] text-gray-400 mt-3">
                {new Date(f.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
