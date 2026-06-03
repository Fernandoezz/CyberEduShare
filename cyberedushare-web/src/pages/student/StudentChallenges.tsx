import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import type { Challenge } from '../../types';

type LeaderboardEntry = {
  userId: string;
  username: string;
  totalPoints: number;
  rank: number;
};

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  Medium: 'bg-amber-50 text-amber-600 border border-amber-100',
  Hard: 'bg-rose-50 text-rose-600 border border-rose-100',
};

const STORAGE_PREFIX = 'student-challenge-workspace:';
const urlRegex = /(https?:\/\/[^\s]+)/g;
const lineUrlRegex = /^https?:\/\/[^\s]+$/i;

const getWorkspaceKey = (challengeId?: string) => `${STORAGE_PREFIX}${challengeId || 'draft'}`;

function normalizeUrl(url: string) {
  if (!url) return '#';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function extractUrls(text?: string) {
  if (!text) return [];
  return Array.from(new Set((text.match(urlRegex) || []).map((url) => normalizeUrl(url.replace(/[),.;]+$/, '')))));
}

function renderTextWithLinks(text?: string) {
  if (!text) return null;

  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {
    const parts = line.split(urlRegex);

    return (
      <span key={`line-${lineIndex}`}>
        {parts.map((part, index) => {
          if (lineUrlRegex.test(part)) {
            const href = normalizeUrl(part.replace(/[),.;]+$/, ''));
            return (
              <a
                key={`${href}-${index}`}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="break-all text-indigo-600 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-700"
              >
                {href}
              </a>
            );
          }

          return <span key={`text-${lineIndex}-${index}`}>{part}</span>;
        })}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    );
  });
}

export default function StudentChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Challenge | null>(null);
  const [flag, setFlag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [diff, setDiff] = useState('');
  const [workspace, setWorkspace] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get('/challenges', { params: { difficulty: diff } })
      .then((r) => setChallenges(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));

    api
      .get('/challenges/leaderboard')
      .then((r) => setLeaderboard(r.data))
      .catch(() => {});
  }, [diff]);

  useEffect(() => {
    if (!selected?._id) {
      setWorkspace('');
      return;
    }

    const savedWorkspace = localStorage.getItem(getWorkspaceKey(selected._id));
    const starterText = [
      `> Challenge loaded: ${selected.title}`,
      `> Category: ${selected.category} | Difficulty: ${selected.difficulty} | Points: ${selected.points}`,
      '> Add your notes, commands, findings, and draft answers here.',
      '> Submit the correct flag in the field below when you are ready.',
      '',
    ].join('\n');

    setWorkspace(savedWorkspace || starterText);
  }, [selected]);

  useEffect(() => {
    if (!selected?._id) return;
    localStorage.setItem(getWorkspaceKey(selected._id), workspace);
  }, [workspace, selected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected?._id || !flag.trim()) return;

    setSubmitting(true);
    setMessage('');

    try {
      const res = await api.post(`/challenges/${selected._id}/submit`, { flag: flag.trim() });
      setMessage(res.data.message);
      setFlag('');
    } catch (e: any) {
      setMessage(e.response?.data?.message || 'Wrong flag');
    }

    setSubmitting(false);
  };

  const selectedLinks = useMemo(() => {
    if (!selected) return [];
    const hintLinks = (selected.hints || []).flatMap((hint) => extractUrls(hint.text));
    return Array.from(new Set([...extractUrls(selected.description), ...hintLinks]));
  }, [selected]);

  if (selected) {
    return (
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <button
              onClick={() => {
                setSelected(null);
                setMessage('');
                setFlag('');
              }}
              className="text-xs text-indigo-500 hover:underline mb-3"
            >
              ← Back to challenges
            </button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-800">{selected.title}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${DIFFICULTY_STYLES[selected.difficulty] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                {selected.difficulty}
              </span>
              <span className="text-xs font-semibold text-gray-500">{selected.points} pts</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {selected.category} • {selected.solves?.length || 0} solves
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-5">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-700 text-slate-100 p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-[0.16em] uppercase text-slate-300 mb-4">Description</p>
              <div className="text-sm leading-8 break-words text-slate-100 whitespace-pre-wrap">
                {renderTextWithLinks(selected.description)}
              </div>
            </div>

            {selectedLinks.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold tracking-[0.16em] uppercase text-gray-500 mb-3">Challenge Links</p>
                <div className="space-y-2">
                  {selectedLinks.map((link) => (
                    <div key={link} className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2">
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm break-all text-indigo-700 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-800"
                      >
                        {link}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!!selected.hints?.length && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold tracking-[0.16em] uppercase text-gray-500 mb-3">Hints</p>
                <div className="space-y-3">
                  {selected.hints.map((hint, index) => (
                    <div key={hint._id || index} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                      <p className="text-[11px] font-semibold text-amber-600 mb-1">Hint {index + 1} · -{hint.penalty} pts</p>
                      <div className="text-sm text-gray-700 break-words whitespace-pre-wrap">{renderTextWithLinks(hint.text)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-[0.16em] uppercase text-gray-500 mb-3">Leaderboard</p>
              <div className="space-y-2">
                {leaderboard.slice(0, 5).map((entry) => (
                  <div key={entry.userId} className="flex items-center justify-between text-sm text-gray-700">
                    <span>
                      {entry.rank}. {entry.username}
                    </span>
                    <span className="font-medium text-gray-500">{entry.totalPoints} pts</span>
                  </div>
                ))}
                {leaderboard.length === 0 && <p className="text-sm text-gray-400">No leaderboard entries yet.</p>}
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-900 bg-slate-950 shadow-xl min-h-[640px] flex flex-col">
            <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3 bg-slate-900">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <p className="text-sm text-slate-300 font-medium">ctf-solver — workspace</p>
            </div>

            <div className="flex-1 p-4">
              <textarea
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                spellCheck={false}
                placeholder="Write notes, commands, payloads, decoded strings, and findings here..."
                className="w-full h-full min-h-[480px] resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm leading-7 text-slate-100 font-mono outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
              />
            </div>

            <div className="border-t border-slate-800 bg-slate-950 px-4 py-3">
              {message && (
                <div
                  className={`mb-3 rounded-lg px-3 py-2 text-xs ${
                    message.includes('🎉') || message.toLowerCase().includes('correct')
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                  }`}
                >
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
                <input
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  placeholder="FLAG{...}"
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-mono text-slate-100 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
                />
                <button
                  type="submit"
                  disabled={submitting || !flag.trim()}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg font-bold text-gray-800 mb-4">Challenges / CTF</h1>
      <div className="flex gap-2 mb-5 flex-wrap">
        <select
          value={diff}
          onChange={(e) => setDiff(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 focus:outline-none"
        >
          <option value="">All difficulties</option>
          {['Easy', 'Medium', 'Hard'].map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        {diff && (
          <button
            onClick={() => setDiff('')}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-500"
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-sm text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-3">
          {challenges.map((challenge) => (
            <div
              key={challenge._id}
              className="border border-gray-100 rounded-2xl p-5 bg-white flex justify-between items-center gap-4 shadow-sm"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-base font-semibold text-gray-800">{challenge.title}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${DIFFICULTY_STYLES[challenge.difficulty] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                    {challenge.difficulty}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {challenge.category} • {challenge.points} pts • {challenge.solves?.length || 0} solves
                </p>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">{challenge.description}</p>
              </div>
              <button
                onClick={() => setSelected(challenge)}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 flex-shrink-0"
              >
                Open
              </button>
            </div>
          ))}
          {challenges.length === 0 && <div className="text-sm text-gray-400">No challenges found.</div>}
        </div>
      )}
    </div>
  );
}
