import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCheck, Lock } from 'lucide-react';
import api from '../../api/axios';

const CRITERIA = [
  { key: 'rating',        label: 'Overall Experience', desc: 'How was your overall experience?' },
  { key: 'communication', label: 'Communication',       desc: 'Were we easy to reach and responsive?' },
  { key: 'quality',       label: 'Work Quality',        desc: 'Did the output meet your expectations?' },
  { key: 'timeliness',    label: 'Timeliness',          desc: 'Were deadlines met?' },
];

function StarPicker({ value, onChange, disabled }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          onMouseEnter={() => !disabled && setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110 disabled:cursor-default focus:outline-none"
        >
          <Star
            size={24}
            className={`transition-colors ${
              n <= (hover || value) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function Stars({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={14} className={n <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const [projects,   setProjects]   = useState([]);
  const [selected,   setSelected]   = useState('');
  const [existing,   setExisting]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [ratings, setRatings] = useState({ rating: 0, communication: 0, quality: 0, timeliness: 0 });
  const [comments, setComments] = useState('');

  useEffect(() => {
    api.get('/portal/projects').then(({ data }) => {
      const eligible = data.projects.filter((p) => ['delivered', 'closed'].includes(p.status));
      setProjects(eligible);
      if (eligible.length === 1) setSelected(eligible[0]._id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    api.get(`/portal/feedback/${selected}`).then(({ data }) => {
      if (data.feedback) {
        setExisting(data.feedback);
        setRatings({
          rating:        data.feedback.rating,
          communication: data.feedback.communication,
          quality:       data.feedback.quality,
          timeliness:    data.feedback.timeliness,
        });
        setComments(data.feedback.comments || '');
      } else {
        setExisting(null);
      }
    });
  }, [selected]);

  const allRated = Object.values(ratings).every((v) => v > 0);

  const submit = async () => {
    if (!allRated || !selected) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await api.post('/portal/feedback', { project: selected, ...ratings, comments });
      setDone(true);
    } catch {
      setSubmitError('Sorry for the inconvenience — we couldn\'t submit your feedback. Please try again or contact info@vichakratechnologies.com.');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse max-w-lg">
      <div className="h-6 w-40 bg-gray-100 rounded" />
      <div className="h-64 bg-white border border-gray-100 rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Share your Feedback</h1>
        <p className="text-[15px] font-medium text-gray-500 mt-2">Your review helps us continuously improve our services.</p>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-sm rounded-[32px] py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <Lock size={24} className="text-gray-300" />
          </div>
          <p className="text-[16px] font-bold text-gray-900">Feedback unlocks after delivery</p>
          <p className="text-[14px] text-gray-500 mt-2 max-w-sm mx-auto">
            Once your project status is "Delivered" or "Closed", you'll be able to leave a detailed review here.
          </p>
        </div>
      ) : (
        <>
          {projects.length > 1 && (
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full px-5 py-4 text-[15px] font-medium border border-gray-200/80 rounded-2xl bg-white/50 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-inner"
            >
              <option value="">Select project…</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select>
          )}

          {selected && (done || existing) ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[32px] shadow-sm p-12 text-center"
            >
              <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
                <CheckCheck size={32} className="text-emerald-600 drop-shadow-sm" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Thank you for your feedback!</h2>
              <p className="text-[15px] text-gray-500 mb-10">Your experience means everything to us.</p>

              <div className="grid grid-cols-2 gap-4 text-left">
                {CRITERIA.map(({ key, label }) => (
                  <div key={key} className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                    <p className="text-[13px] font-bold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
                    <Stars value={ratings[key]} />
                  </div>
                ))}
              </div>

              {comments && (
                <blockquote className="mt-8 border-l-4 border-teal-300 pl-5 text-[15px] text-gray-700 italic text-left bg-teal-50/50 p-4 rounded-r-2xl">
                  "{comments}"
                </blockquote>
              )}
            </motion.div>
          ) : selected ? (
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-[32px] shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100/80">
                {CRITERIA.map(({ key, label, desc }) => (
                  <div key={key} className="px-8 py-6 hover:bg-gray-50/30 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-[16px] font-bold text-gray-800">{label}</p>
                        <p className="text-[13px] font-medium text-gray-500 mt-1 max-w-sm">{desc}</p>
                      </div>
                      <StarPicker
                        value={ratings[key]}
                        onChange={(v) => setRatings((r) => ({ ...r, [key]: v }))}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-8 py-6 border-t border-gray-100/80 bg-gray-50/50">
                <label className="block text-[14px] font-bold text-gray-700 tracking-wide mb-3">
                  Additional comments <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={5}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Tell us about your experience working with Vichakra…"
                  className="w-full px-5 py-4 text-[15px] border border-gray-200/80 rounded-2xl bg-white/50 backdrop-blur-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white focus:border-teal-500 transition-all resize-none shadow-inner"
                />
              </div>

              <div className="px-8 py-6 border-t border-gray-100 bg-white/30 backdrop-blur-sm">
                {submitError && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">
                    <span className="shrink-0">⚠</span> {submitError}
                  </div>
                )}
                <button
                  onClick={submit}
                  disabled={!allRated || submitting}
                  className="w-full py-4 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none text-white font-bold rounded-2xl text-[16px] shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all"
                >
                  {submitting ? 'Submitting…' : !allRated ? 'Rate all criteria to continue' : 'Submit Feedback'}
                </button>
                {!allRated && (
                  <p className="text-center text-[13px] font-bold text-gray-400 mt-3 uppercase tracking-widest">
                    {Object.values(ratings).filter((v) => v > 0).length}/4 criteria rated
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
