import { useRef, useState } from 'react';
import api from '../../api/axios';

type UploadFile = { name: string; progress: number };

export default function FacultyUpload() {
  const [form, setForm] = useState({
    title: '',
    course: '',
    tags: '',
    difficulty: 'Medium',
    notes: '',
  });
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected.map(f => ({ name: f.name, progress: Math.floor(Math.random() * 60) + 40 })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileRef.current?.files?.length) return alert('Please select a file');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('file', fileRef.current.files[0]);
      await api.post('/content', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Uploaded successfully!');
      setForm({ title: '', course: '', tags: '', difficulty: 'Medium', notes: '' });
      setFiles([]);
    } catch {
      alert('Upload failed');
    }
    setSaving(false);
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Upload Resource</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title: <span className="text-red-500">*</span>
          </label>
          <input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
            placeholder="Enter a clear title for your file"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
          />
        </div>

        {/* Course */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course: <span className="text-red-500">*</span>
          </label>
          <input
            value={form.course}
            onChange={e => setForm(f => ({ ...f, course: e.target.value }))}
            required
            placeholder="Select Course"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags:</label>
          <input
            value={form.tags}
            onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            placeholder="Insert Tags"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty:</label>
          <div className="flex gap-4">
            {['Easy', 'Medium', 'Hard'].map(d => (
              <label key={d} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
                <input
                  type="radio"
                  name="difficulty"
                  value={d}
                  checked={form.difficulty === d}
                  onChange={() => setForm(f => ({ ...f, difficulty: d }))}
                  className="accent-indigo-600"
                />
                {d}
              </label>
            ))}
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File Upload: <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Browse
            </button>
            <button type="button" className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Upload
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.zip,.mp4,.jpg,.jpeg,.png"
            className="hidden"
          />
          <p className="text-xs text-gray-400 mb-2">Tap to choose file (PDF / ZIP / Video / Image)</p>

          {/* File progress bars */}
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 mb-1.5">
              <span className="text-xs text-gray-600 w-28 truncate">{f.name}</span>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${f.progress}%` }}
                />
              </div>
              <button
                type="button"
                onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                className="text-gray-400 hover:text-red-400 text-sm"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Optional Notes: (README)</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={4}
            placeholder="Add explanation, description, or instructions"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 resize-none"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {saving ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}
