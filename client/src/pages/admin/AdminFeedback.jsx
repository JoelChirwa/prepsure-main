import { useEffect, useState } from "react";
import { LifeBuoy, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { adminApi } from "../../lib/adminApi";

const statusLabels = {
  new: "New",
  in_progress: "In progress",
  resolved: "Resolved",
};

export default function AdminFeedback() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 0, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [notes, setNotes] = useState({});

  useEffect(() => {
    let active = true;
    adminApi.listFeedback(token, { search, status, category, page })
      .then(({ feedback, pagination: pageData }) => {
        if (active) {
          setError("");
          setItems(feedback || []);
          setPagination(pageData || { page: 1, pages: 0, total: 0 });
          setNotes(Object.fromEntries((feedback || []).map((item) => [
            item._id,
            item.resolutionNote || "",
          ])));
        }
      })
      .catch((err) => {
        if (active) setError(err.message || "Could not load feedback.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [category, page, search, status, token]);

  async function updateItem(item, nextStatus) {
    setSavingId(item._id);
    setError("");
    setNotice("");
    try {
      const { feedback } = await adminApi.updateFeedback(token, item._id, {
        status: nextStatus,
        resolutionNote: notes[item._id] || "",
      });
      setItems((current) => current.map((entry) =>
        entry._id === item._id ? feedback : entry
      ));
      setNotice(`Feedback "${item.subject}" marked ${statusLabels[nextStatus].toLowerCase()}.`);
    } catch (err) {
      setError(err.message || "Could not update this feedback item.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-5 text-slate-900 sm:p-6 lg:p-8">
      <header>
        <p className="text-sm font-semibold text-slate-500">SUPPORT OPERATIONS</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Help and feedback</h1>
        <p className="mt-2 text-sm text-slate-600">
          Review incoming messages and track follow-up in the staff inbox.
        </p>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}

      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto_auto]">
        <label className="relative">
          <span className="sr-only">Search feedback</span>
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search messages..."
            className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </label>
        <label>
          <span className="sr-only">Filter by status</span>
          <select value={status} onChange={(event) => {
            setPage(1);
            setStatus(event.target.value);
          }} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm">
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by category</span>
          <select value={category} onChange={(event) => {
            setPage(1);
            setCategory(event.target.value);
          }} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm">
            <option value="">All categories</option>
            <option value="question">Question</option>
            <option value="feedback">Feedback</option>
          </select>
        </label>
      </section>

      <section className="space-y-4">
        {loading ? (
          <p className="py-12 text-center text-sm text-slate-500">Loading feedback...</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
            <LifeBuoy className="mx-auto size-9 text-slate-400" />
            <h2 className="mt-3 font-semibold text-slate-800">No messages found</h2>
            <p className="mt-1 text-sm text-slate-500">New questions and feedback will appear here.</p>
          </div>
        ) : items.map((item) => (
          <article key={item._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700">{item.category}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === "resolved" ? "bg-emerald-50 text-emerald-700" : item.status === "in_progress" ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-700"}`}>
                    {statusLabels[item.status] || item.status}
                  </span>
                </div>
                <h2 className="mt-3 text-lg font-semibold text-slate-900">{item.subject}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {item.name} · <a className="underline underline-offset-2" href={`mailto:${encodeURIComponent(item.email)}`}>{item.email}</a>
                </p>
                <p className="mt-1 text-xs text-slate-500">Received {new Date(item.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-800">
              {item.message}
            </p>
            <label htmlFor={`feedback-note-${item._id}`} className="mt-4 block text-sm font-medium text-slate-700">
              Internal resolution note
            </label>
            <textarea
              id={`feedback-note-${item._id}`}
              rows={2}
              maxLength={2000}
              value={notes[item._id] || ""}
              onChange={(event) => setNotes((current) => ({
                ...current,
                [item._id]: event.target.value,
              }))}
              placeholder="Optional staff-only follow-up note..."
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              {item.status !== "new" && (
                <button type="button" disabled={savingId === item._id} onClick={() => updateItem(item, "new")} className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                  Reopen
                </button>
              )}
              {item.status !== "in_progress" && item.status !== "resolved" && (
                <button type="button" disabled={savingId === item._id} onClick={() => updateItem(item, "in_progress")} className="min-h-10 rounded-lg border border-amber-200 px-3 text-sm font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-50">
                  Mark in progress
                </button>
              )}
              {item.status !== "resolved" && (
                <button type="button" disabled={savingId === item._id} onClick={() => updateItem(item, "resolved")} className="min-h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50">
                  {savingId === item._id ? "Saving..." : "Resolve"}
                </button>
              )}
            </div>
            {item.status === "resolved" && item.resolvedAt && (
              <p className="mt-3 text-right text-xs text-slate-500">
                Resolved {new Date(item.resolvedAt).toLocaleString()}
                {item.updatedBy?.name ? ` by ${item.updatedBy.name}` : ""}
              </p>
            )}
          </article>
        ))}
      </section>
      {!loading && pagination.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>{pagination.total} messages</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="min-h-9 rounded-lg border border-slate-200 px-3 disabled:opacity-40">Previous</button>
            <span>Page {page} of {pagination.pages}</span>
            <button type="button" disabled={page >= pagination.pages} onClick={() => setPage((current) => current + 1)} className="min-h-9 rounded-lg border border-slate-200 px-3 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
