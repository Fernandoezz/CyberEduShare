import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

type Project = {
  _id: string;
  title: string;
  description: string;
  subject: string;
  techStack?: string[];
  submittedByName?: string;
  fileUrl?: string;
};

const COURSES = ['CS101', 'CS102', 'CS201', 'CS205', 'Networks', 'Cryptography', 'OS'];
const LANGUAGES = ['Python', 'Java', 'JavaScript', 'C++', 'Go'];

export default function StudentProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Project | null>(null);

  const [course, setCourse] = useState('');
  const [lang, setLang] = useState('');

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects', {
        params: { subject: course, lang }
      });
      setProjects(res.data.projects || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [course, lang]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const langMatch =
        !lang || (p.techStack || []).some((t) => t.toLowerCase() === lang.toLowerCase());
      return langMatch;
    });
  }, [projects, lang]);

  const resetForm = () => {
    setTitle('');
    setSubject('');
    setDescription('');
    setTechStack('');
    setZipFile(null);
    setFormError('');
    setFormSuccess('');
    const fileInput = document.getElementById('zip-upload') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError('');
    setFormSuccess('');

    const file = e.target.files?.[0] || null;
    if (!file) {
      setZipFile(null);
      return;
    }

    const isZip =
      file.type === 'application/zip' ||
      file.type === 'application/x-zip-compressed' ||
      file.name.toLowerCase().endsWith('.zip');

    if (!isZip) {
      setFormError('Please upload a .zip file only.');
      setZipFile(null);
      e.target.value = '';
      return;
    }

    setZipFile(file);
  };

  const handleUploadProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!title.trim()) {
      setFormError('Project title is required.');
      return;
    }

    if (!subject.trim()) {
      setFormError('Subject is required.');
      return;
    }

    if (!description.trim()) {
      setFormError('Project description is required.');
      return;
    }

    if (!zipFile) {
      setFormError('Please choose a ZIP file.');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('subject', subject.trim());
      formData.append('description', description.trim());
      formData.append('techStack', techStack.trim());
      formData.append('projectFile', zipFile);

      await api.post('/projects', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFormSuccess('Project uploaded successfully.');
      resetForm();
      fetchProjects();
    } catch (error: any) {
      console.error('Project upload failed:', error?.response?.data || error);
      setFormError(
        error?.response?.data?.message || 'Failed to upload project. Check backend upload handling.'
      );
    } finally {
      setUploading(false);
    }
  };

  if (selected) {
    return (
      <div>
        <h1 className="text-lg font-bold text-gray-800 mb-4">Projects Repository</h1>

        <button
          onClick={() => setSelected(null)}
          className="text-xs text-indigo-500 hover:underline mb-4"
        >
          ← Back to list
        </button>

        <h2 className="text-base font-bold text-gray-800 mb-4">{selected.title}</h2>

        <div className="border border-gray-100 rounded-lg p-5 bg-white mb-3">
          <p className="text-xs font-semibold text-gray-500 mb-2">Project Description</p>
          <p className="text-sm text-gray-700">{selected.description}</p>
        </div>

        {selected.fileUrl && (
          <div className="border border-gray-100 rounded-lg p-5 bg-white mb-3">
            <p className="text-xs font-semibold text-gray-500 mb-3">Files</p>
            <a
              href={selected.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-sm text-gray-700 hover:text-indigo-600"
            >
              <span>Project ZIP File</span>
              <span className="text-indigo-500 text-xs">Download ↓</span>
            </a>
          </div>
        )}

        <div className="border border-gray-100 rounded-lg p-5 bg-white mb-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">Author Information</p>
          <p className="text-sm text-gray-700">By: {selected.submittedByName}</p>
          <p className="text-xs text-gray-400 mt-1">
            Tech Stack: {selected.techStack?.join(', ') || 'N/A'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Subject: {selected.subject}</p>
        </div>

        <h3 className="text-sm font-semibold text-gray-700 mb-3">Related Projects</h3>
        <div className="space-y-2">
          {filteredProjects
            .filter((p) => p._id !== selected._id && p.subject === selected.subject)
            .slice(0, 3)
            .map((p) => (
              <div
                key={p._id}
                onClick={() => setSelected(p)}
                className="border border-gray-100 rounded-lg p-4 bg-white flex justify-between items-center cursor-pointer hover:border-indigo-200"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.title}</p>
                  <p className="text-xs text-gray-400">By: {p.submittedByName}</p>
                  <p className="text-xs text-gray-400 line-clamp-1">{p.description}</p>
                </div>
                <span className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-xs flex-shrink-0 ml-3">
                  ›
                </span>
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg font-bold text-gray-800 mb-4">Projects Repository</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex gap-2 mb-5 flex-wrap">
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 focus:outline-none"
            >
              <option value="">Course ▾</option>
              {COURSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 focus:outline-none"
            >
              <option value="">Language ▾</option>
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>

            {(course || lang) && (
              <button
                onClick={() => {
                  setCourse('');
                  setLang('');
                }}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-500"
              >
                Clear
              </button>
            )}
          </div>

          <h2 className="text-sm font-semibold text-gray-700 mb-3">List of Projects</h2>

          {loading ? (
            <div className="text-sm text-gray-400">Loading...</div>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map((p) => (
                <div
                  key={p._id}
                  className="border border-gray-100 rounded-lg p-4 bg-white flex justify-between items-center"
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-medium text-gray-800">{p.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">By: {p.submittedByName}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">
                      Description: {p.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      Tags: {(p.techStack || []).map((t: string) => `[${t}]`).join(' ')} [{p.subject}]
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(p)}
                    className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-xs flex-shrink-0"
                  >
                    ›
                  </button>
                </div>
              ))}

              {filteredProjects.length === 0 && (
                <div className="text-sm text-gray-400">No projects found.</div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 h-fit">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Upload Project</h2>

          <form onSubmit={handleUploadProject} className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project title"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />

            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">Select subject</option>
              {COURSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="Tech stack (comma separated)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project description"
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Upload ZIP file
              </label>
              <input
                id="zip-upload"
                type="file"
                accept=".zip,application/zip,application/x-zip-compressed"
                onChange={handleZipChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none"
              />
              {zipFile && (
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {zipFile.name}
                </p>
              )}
            </div>

            {formError && <p className="text-xs text-red-500">{formError}</p>}
            {formSuccess && <p className="text-xs text-green-600">{formSuccess}</p>}

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-semibold px-4 py-2.5 rounded-lg text-sm"
            >
              {uploading ? 'Uploading...' : 'Upload Project'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}