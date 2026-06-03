import { useEffect, useState } from 'react';
import api from '../../api/axios';

function fixVmUrl(url?: string) {
  if (!url) return '';

  const frontendHost = window.location.hostname;

  return url
    .replace('10.0.2.2', frontendHost)
    .replace('localhost', frontendHost)
    .replace('127.0.0.1', frontendHost);
}

export default function StudentLabs() {
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    api
      .get('/labs')
      .then((r) => setLabs(r.data))
      .catch((e) => console.error('Fetch labs error:', e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;

    setTimeLeft((selected.duration || 30) * 60);

    const timer = setInterval(() => {
      setTimeLeft((s) => Math.max(0, s - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [selected]);

  const launchLab = async (lab: any) => {
    try {
      const res = await api.get(`/labs/${lab._id}`);
      setSelected(res.data);
    } catch (e) {
      console.error('Launch lab error:', e);
      alert('Failed to launch lab.');
    }
  };

  const fmtTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (selected) {
    const labUrl = fixVmUrl(selected.vmUrl);

    return (
      <div>
        <h1 className="text-lg font-bold text-gray-800 mb-4">Virtual Labs</h1>

        <button
          onClick={() => setSelected(null)}
          className="text-xs text-indigo-500 hover:underline mb-4"
        >
          ← Back to labs
        </button>

        <h2 className="text-base font-bold text-gray-800 mb-4">
          {selected.title}
        </h2>

        <div className="border border-gray-100 rounded-lg p-5 bg-white mb-3 flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">
              Session Info
            </p>
            <p className="text-sm text-gray-700">
              Time left: {fmtTime(timeLeft)}
            </p>
            <p className="text-sm text-gray-700">Status: Running</p>
          </div>

          
        </div>

        <div className="border border-gray-100 rounded-lg p-5 bg-white mb-3">
          <p className="text-xs font-semibold text-gray-500 mb-2">
            Instructions
          </p>

          {selected.instructions?.length > 0 ? (
            selected.instructions.map((ins: string, i: number) => (
              <p key={i} className="text-sm text-gray-700">
                Step {i + 1}: {ins}
              </p>
            ))
          ) : (
            <p className="text-sm text-gray-700">Follow the lab guide.</p>
          )}

          {selected.vmUsername && (
            <div className="mt-2 text-xs text-gray-400">
              Login: {selected.vmUsername} / {selected.vmPassword || 'hidden'}
            </div>
          )}
        </div>

        {labUrl && (
          <div className="border border-gray-100 rounded-lg p-5 bg-white mb-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">
              Console Viewer
            </p>

            <iframe
              src={labUrl}
              title="Lab Console"
              className="w-full h-[520px] rounded-lg border border-gray-200 bg-gray-50"
            />

            
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={() => setSelected(null)}
            className="bg-indigo-500 text-white text-sm px-6 py-2.5 rounded-lg hover:bg-indigo-600"
          >
            End Lab Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg font-bold text-gray-800 mb-4">Virtual Labs</h1>
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Lab Cards</h2>

      {loading ? (
        <div className="text-sm text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-3">
          {labs.map((lab: any) => (
            <div
              key={lab._id}
              className="border border-gray-100 rounded-lg p-4 bg-white flex justify-between items-center"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {lab.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Duration: {lab.duration} mins
                </p>
                <p className="text-xs text-gray-400">
                  Short instructions: "
                  {lab.instructions?.[0] || 'Follow lab guide'}"
                </p>
                <p className="text-xs text-gray-400">Status: Available</p>
              </div>

              <button
                onClick={() => launchLab(lab)}
                className="bg-indigo-500 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-indigo-600 flex-shrink-0"
              >
                Launch
              </button>
            </div>
          ))}

          {labs.length === 0 && (
            <div className="text-sm text-gray-400">No labs available.</div>
          )}
        </div>
      )}
    </div>
  );
}