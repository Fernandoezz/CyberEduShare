import { useEffect, useState } from 'react';
import api from '../../api/axios';

type ContentItem = {
  _id: string;
  title: string;
  status: 'Approved' | 'Pending';
  downloads?: number;
  rating?: number;
  uploadedAt?: string;
  fileUrl?: string;
};

type QuestionItem = {
  _id: string;
  title: string;
  subject: string;
  askedByName?: string;
  answerCount?: number;
  createdAt?: string;
};

export default function FacultyMyContent() {
  const [resources, setResources] = useState<ContentItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Approved' | 'Pending' | 'Drafts'>('All');

  const fetchResources = async () => {
    try {
      const res = await api.get('/content/search');
      setResources(res.data.results || []);
    } catch (e) {
      console.error('Fetch resources error:', e);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/questions');
      setQuestions(res.data.questions || []);
    } catch (e) {
      console.error('Fetch questions error:', e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchResources(), fetchQuestions()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered =
    filter === 'All'
      ? resources
      : resources.filter((r) => r.status === filter);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resource?')) return;

    try {
      await api.delete(`/content/${id}`);
      fetchData();
    } catch {
      alert('Failed');
    }
  };

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-xl font-bold text-gray-800 mb-5">My Content</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(['Approved', 'Pending', 'Drafts'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(filter === f ? 'All' : f)}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
              filter === f
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-gray-300 text-gray-600 hover:border-indigo-400'
            }`}
          >
            {f}
          </button>
        ))}

        <button
          onClick={() => setFilter('All')}
          className="px-4 py-1.5 rounded-full text-sm border border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-500 transition-colors"
        >
          Clear
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading...</div>
      ) : (
        <>
          <div className="space-y-4 mb-10">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Content Row
            </p>

            {filtered.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No content found.
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-xl border border-gray-100 px-5 py-4"
                >
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-800">
                      {item.title}
                    </p>

                    <p className="text-xs text-gray-400 mt-0.5">
                      Status: {item.status}
                      {item.uploadedAt && ` | Uploaded: ${item.uploadedAt}`}
                      {item.downloads !== undefined &&
                        ` | Downloads: ${item.downloads}`}
                      {item.rating !== undefined && ` | Rating: ${item.rating}`}
                    </p>
                  </div>

                  <div className="flex gap-2 justify-end">
                    {item.status === 'Pending' ? (
                      <>
                        <button className="bg-indigo-600 text-white text-xs px-4 py-1.5 rounded-full hover:bg-indigo-700 transition-colors">
                          Edit
                        </button>

                        <button className="bg-indigo-600 text-white text-xs px-4 py-1.5 rounded-full hover:bg-indigo-700 transition-colors">
                          Request Re-Moderation
                        </button>

                        <button
                          onClick={() => handleDelete(item._id)}
                          className="bg-indigo-600 text-white text-xs px-4 py-1.5 rounded-full hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="bg-indigo-600 text-white text-xs px-4 py-1.5 rounded-full hover:bg-indigo-700 transition-colors">
                          Edit
                        </button>

                        <button className="bg-indigo-600 text-white text-xs px-4 py-1.5 rounded-full hover:bg-indigo-700 transition-colors">
                          View Analytics
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Student Questions
            </p>

            {questions.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No student questions found.
              </div>
            ) : (
              questions.map((q) => (
                <div
                  key={q._id}
                  className="bg-white rounded-xl border border-gray-100 px-5 py-4"
                >
                  <p className="text-sm font-semibold text-gray-800">
                    {q.title}
                  </p>

                  <p className="text-xs text-gray-400 mt-0.5">
                    Subject: {q.subject}
                    {q.askedByName && ` | Asked by ${q.askedByName}`}
                    {` | ${q.answerCount || 0} Answers`}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}