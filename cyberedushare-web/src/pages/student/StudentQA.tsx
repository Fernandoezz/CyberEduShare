import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function StudentQA() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [askTitle, setAskTitle] = useState('');
  const [askBody, setAskBody] = useState('');
  const [askSubject, setAskSubject] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchQ = async () => {
    setLoading(true);
    try {
      const res = await api.get('/questions');
      setQuestions(res.data.questions || []);
    } catch (e) {
      console.error('Fetch questions error:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQ();
  }, []);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!askTitle.trim() || !askSubject.trim()) {
      alert('Please enter both subject and question.');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/questions', {
        title: askTitle,
        body: askBody || askTitle,
        subject: askSubject,
        tags: '',
      });

      setAskTitle('');
      setAskBody('');
      setAskSubject('');
      fetchQ();
    } catch (e) {
      console.error('Post question error:', e);
      alert('Failed to post question.');
    }

    setSubmitting(false);
  };

  const handleAnswer = async (qId: string) => {
    const body = answerMap[qId];

    if (!body?.trim()) return;

    try {
      await api.post(`/questions/${qId}/answers`, { body });
      setAnswerMap((m) => ({ ...m, [qId]: '' }));
      fetchQ();
    } catch (e) {
      console.error('Post answer error:', e);
      alert('Failed to post answer.');
    }
  };

  return (
    <div>
      <h1 className="text-lg font-bold text-gray-800 mb-4">Q&A</h1>

      <div className="flex gap-2 mb-5">
        {['Bookmark', 'All', 'Course'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              filter === f
                ? 'bg-indigo-500 text-white border-indigo-500'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-gray-700 mb-3">Questions List</h2>

      <div className="space-y-3 mb-8">
        {loading ? (
          <div className="text-sm text-gray-400">Loading...</div>
        ) : questions.length === 0 ? (
          <div className="text-sm text-gray-400">No questions found.</div>
        ) : (
          questions.map((q: any) => (
            <div key={q._id} className="border border-gray-100 rounded-lg p-4 bg-white">
              <p className="text-sm font-medium text-gray-800">{q.title}</p>

              <p className="text-xs text-gray-400 mt-0.5">
                Subject: {q.subject}
                {q.askedByName && ` | Asked by ${q.askedByName}`}
              </p>

              {q.tags?.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Tags: {q.tags.map((t: string) => `[${t}]`).join(' ')}
                </p>
              )}

              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setExpandedId(expandedId === q._id ? null : q._id)}
                  className="bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-600"
                >
                  Add Answer
                </button>

                <button className="bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-600">
                  {q.answerCount || 0} Answers
                </button>
              </div>

              {expandedId === q._id && (
                <div className="mt-3 flex gap-2">
                  <input
                    value={answerMap[q._id] || ''}
                    onChange={(e) =>
                      setAnswerMap((m) => ({
                        ...m,
                        [q._id]: e.target.value,
                      }))
                    }
                    placeholder="Write your answer..."
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />

                  <button
                    onClick={() => handleAnswer(q._id)}
                    className="bg-indigo-500 text-white text-xs px-3 py-2 rounded-lg hover:bg-indigo-600"
                  >
                    Post
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <h2 className="text-sm font-semibold text-gray-700 mb-3">Ask Question</h2>

      <form onSubmit={handleAsk} className="space-y-3">
        <input
          value={askSubject}
          onChange={(e) => setAskSubject(e.target.value)}
          placeholder="Subject e.g. Cryptography"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />

        <textarea
          value={askTitle}
          onChange={(e) => {
            setAskTitle(e.target.value);
            setAskBody(e.target.value);
          }}
          placeholder="Enter Question"
          rows={4}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
        />

        <button
          type="submit"
          disabled={submitting}
          className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg text-sm"
        >
          {submitting ? 'Posting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}