import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

interface ContentItem {
  _id: string;
  title: string;
  subject: string;
  difficulty: string;
  tags: string[];
  uploaderName: string;
  uploaderRole?: string;
  autoScore?: number;
  nluConfidence?: number;
  type: string;
  fileUrl?: string;
  description?: string;
}

function saveToLocalHistory(
  id: string,
  title: string,
  action: "approved" | "rejected" | "requested_changes",
  notes: string,
) {
  const existing = JSON.parse(
    localStorage.getItem("moderationHistory") ?? "[]",
  );

  const entry = {
    _id: `${id}-${Date.now()}`,
    contentId: id,
    contentTitle: title,
    action,
    notes: notes.trim() || undefined,
    timestamp: new Date().toISOString(),
  };

  localStorage.setItem(
    "moderationHistory",
    JSON.stringify([entry, ...existing]),
  );
}

export default function ModeratorReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    api
      .get(`/admin/content/${id}`)
      .then((r) => setItem(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    if (!id || !item) return;

    setSubmitting(true);

    try {
      await api.put(`/admin/content/${id}/approve`, { notes });
      saveToLocalHistory(id, item.title, "approved", notes);
      navigate("/moderator/queue");
    } catch {
      alert("Failed to approve.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!id || !item) return;

    if (!notes.trim()) {
      alert("Please add notes before requesting changes.");
      return;
    }

    setSubmitting(true);

    try {
      await api.put(`/admin/content/${id}/request-changes`, { notes });
      saveToLocalHistory(id, item.title, "requested_changes", notes);
      navigate("/moderator/queue");
    } catch {
      alert("Failed to request changes.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!id || !item) return;

    if (!confirm("Reject this content? This action cannot be undone.")) return;

    setSubmitting(true);

    try {
      await api.delete(`/admin/content/${id}`, { data: { notes } });
      saveToLocalHistory(id, item.title, "rejected", notes);
      navigate("/moderator/queue");
    } catch {
      alert("Failed to reject.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      await api.put(`/admin/content/${id}/notes`, { notes });
      alert("Notes saved.");
    } catch {
      alert("Failed to save notes.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Loading content...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        Content not found.{" "}
        <button
          onClick={() => navigate("/moderator/queue")}
          className="text-indigo-600 underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Actions */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-700 mb-3">Actions</h2>

        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            disabled={submitting}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            Approve
          </button>

          <button
            onClick={handleRequestChanges}
            disabled={submitting}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            Request Changes
          </button>

          <button
            onClick={handleReject}
            disabled={submitting}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            Reject
          </button>
        </div>
      </section>

      {/* Moderator Notes */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">
          Moderator Notes
        </h2>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes for the uploader or for the record..."
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />

        <div className="flex justify-end mt-3">
          <button
            onClick={handleSave}
            className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Save
          </button>
        </div>
      </section>
    </div>
  );
}