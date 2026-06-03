import { useRef, useState } from 'react';
import api from '../../api/axios';

const COURSES = ['CS101','CS102','CS201','CS205','Networks','Cryptography','OS'];

export default function StudentUpload() {
  const [form, setForm] = useState({ title: '', subject: '', tags: '', difficulty: 'Easy', notes: '' });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Please select a file'); return; }
    setUploading(true); setError(''); setSuccess('');
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('subject', form.subject);
      fd.append('tags', form.tags);
      fd.append('difficulty', form.difficulty);
      fd.append('description', form.notes);
      fd.append('file', file);
      await api.post('/content', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => setProgress(Math.round((e.loaded * 100) / (e.total || 1))),
      });
      setSuccess('Resource uploaded successfully!');
      setForm({ title:'', subject:'', tags:'', difficulty:'Easy', notes:'' });
      setFile(null); setProgress(0);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Upload failed');
    }
    setUploading(false);
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-lg font-bold text-gray-800 mb-6">Upload Resource</h1>
      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm mb-4">{success}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Title: <span className="text-red-500">*</span></label>
          <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="Enter a clear title for your file" required
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Course: <span className="text-red-500">*</span></label>
          <select value={form.subject} onChange={e => setForm(f=>({...f,subject:e.target.value}))} required
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-500">
            <option value="">Select Course</option>
            {COURSES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Tags:</label>
          <input value={form.tags} onChange={e => setForm(f=>({...f,tags:e.target.value}))} placeholder="Insert Tags"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Difficulty:</label>
          <div className="flex gap-4">
            {['Easy','Medium','Hard'].map(d => (
              <label key={d} className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                <input type="radio" name="difficulty" value={d} checked={form.difficulty===d} onChange={() => setForm(f=>({...f,difficulty:d}))}
                  className="accent-indigo-500" />
                {d}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">File Upload: <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <div className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-400 truncate">
              {file ? file.name : 'Tap to choose file (PDF / ZIP / Video / Image)'}
            </div>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="bg-indigo-500 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-indigo-600">Browse</button>
            <input ref={fileRef} type="file" className="hidden" accept=".pdf,.zip,.mp4,.jpg,.jpeg,.png"
              onChange={e => setFile(e.target.files?.[0] || null)} />
          </div>
          {file && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{file.name}</span>
                <button type="button" onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500">✕</button>
              </div>
              {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{width:`${progress}%`}} />
                </div>
              )}
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Optional Notes (README):</label>
          <textarea value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} rows={4}
            placeholder="Add explanation, description, or instructions"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={uploading}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-semibold px-8 py-2.5 rounded-lg text-sm">
            {uploading ? `Uploading ${progress}%...` : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}