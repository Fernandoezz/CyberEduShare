import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

interface QueueItem {
  _id: string;
  title: string;
  type: string;
  subject: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  uploaderName?: string;
  uploaderRole?: string;
  askedByName?: string;
  autoScore?: number;
  priority?: 'High' | 'Medium' | 'Low';
  createdAt: string;
  queueType: 'content' | 'question';
}

function getPriority(item: QueueItem): 'High' | 'Medium' | 'Low' {
  if (item.priority) return item.priority;

  if (item.queueType === 'question') return 'Medium';

  if (item.autoScore !== undefined) {
    if (item.autoScore >= 0.8) return 'High';
    if (item.autoScore >= 0.6) return 'Medium';
    return 'Low';
  }

  return 'Medium';
}

const PRIORITY_COLORS: Record<string, string> = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-green-100 text-green-700',
};

export default function ModeratorDashboard() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchQueue = async () => {
    setLoading(true);

    try {
      const [contentRes, questionRes] = await Promise.all([
        api.get('/admin/content/pending'),
        api.get('/questions'),
      ]);

      const contentItems: QueueItem[] = (contentRes.data.content ?? []).map(
        (item: any) => ({
          ...item,
          queueType: 'content',
        })
      );

      const questionItems: QueueItem[] = (questionRes.data.questions ?? []).map(
        (q: any) => ({
          _id: q._id,
          title: q.title,
          type: 'Question',
          subject: q.subject,
          difficulty: 'Medium',
          uploaderName: q.askedByName || 'Student',
          uploaderRole: 'Student',
          askedByName: q.askedByName,
          autoScore: undefined,
          priority: 'Medium',
          createdAt: q.createdAt,
          queueType: 'question',
        })
      );

      setQueue([...contentItems, ...questionItems]);
    } catch (error) {
      console.error('Fetch moderation queue error:', error);
      setQueue([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const counts = {
    High: queue.filter((i) => getPriority(i) === 'High').length,
    Medium: queue.filter((i) => getPriority(i) === 'Medium').length,
    Low: queue.filter((i) => getPriority(i) === 'Low').length,
  };

  return (
    <div className="p-8 max-w-3xl">
      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-700 mb-3">
          Queue Summary
        </h2>

        <div className="flex gap-3 flex-wrap">
          <span className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-full">
            Low: {counts.Low}
          </span>

          <span className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-full">
            High Priority: {counts.High}
          </span>

          <span className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-full">
            Medium: {counts.Medium}
          </span>
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          Moderation Queue
        </h2>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            Loading queue...
          </div>
        ) : queue.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-gray-500 text-sm">No items pending review.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map((item, idx) => {
              const priority = getPriority(item);

              return (
                <div
                  key={`${item.queueType}-${item._id}`}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-gray-800">
                        #{idx + 1} {item.title}
                      </span>

                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700">
                        {item.queueType === 'question' ? 'Question' : 'Content'}
                      </span>

                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[priority]}`}
                      >
                        Priority: {priority}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500">
                      Subject: {item.subject || 'N/A'} | AutoScore:{' '}
                      {item.autoScore?.toFixed(2) ?? 'N/A'} | Uploader:{' '}
                      {item.uploaderName ||
                        item.askedByName ||
                        item.uploaderRole ||
                        'Student'}
                    </p>
                  </div>

                  {item.queueType === 'content' ? (
                    <button
                      onClick={() => navigate(`/moderator/review/${item._id}`)}
                      className="flex-shrink-0 px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Review
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/moderator/questions/${item._id}`)}
                      className="flex-shrink-0 px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Review
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}