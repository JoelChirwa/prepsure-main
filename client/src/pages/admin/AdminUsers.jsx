import { useEffect, useState } from "react";
import { Search, ShieldAlert, ShieldCheck, UserRound, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { adminApi } from "../../lib/adminApi";

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 0, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [historyFor, setHistoryFor] = useState(null);
  const [history, setHistory] = useState([]);
  const [reasonFor, setReasonFor] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    let active = true;
    adminApi.listUsers(token, { search, status, page })
      .then((data) => {
        if (active) {
          setUsers(data.users || []);
          setPagination(data.pagination || { page: 1, pages: 0, total: 0 });
        }
      })
      .catch((err) => {
        if (active) setError(err.message || "Could not load student accounts.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, search, status, token]);

  async function toggleStatus(user) {
    setSavingId(user._id);
    setError("");
    setNotice("");
    try {
      const data = await adminApi.updateUserStatus(token, user._id, {
        isActive: !user.isActive,
        reason: reason.trim(),
      });
      setUsers((current) => current.flatMap((item) => {
        if (item._id !== user._id) return [item];
        if (
          (status === "active" && !data.user.isActive) ||
          (status === "suspended" && data.user.isActive)
        ) {
          return [];
        }
        return [{ ...item, isActive: data.user.isActive }];
      }));
      setNotice(data.message);
      setReasonFor(null);
      setReason("");
      if (historyFor?._id === user._id) {
        const result = await adminApi.getUserStatusHistory(token, user._id);
        setHistory(result.history || []);
      }
    } catch (err) {
      setError(err.message || "Could not update the account status.");
    } finally {
      setSavingId(null);
    }
  }

  async function viewHistory(user) {
    setHistoryFor(user);
    setHistory([]);
    setError("");
    try {
      const data = await adminApi.getUserStatusHistory(token, user._id);
      setHistory(data.history || []);
    } catch (err) {
      setError(err.message || "Could not load account status history.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-5 text-slate-900 sm:p-6 lg:p-8">
      <header>
        <p className="text-sm font-semibold text-slate-500">ACCOUNT OPERATIONS</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Student accounts</h1>
        <p className="mt-2 text-sm text-slate-600">
          Search student accounts, manage access, and review status-change history.
        </p>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search students</span>
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search name or email..."
            className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </label>
        <label>
          <span className="sr-only">Account status</span>
          <select
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="all">All accounts</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </label>
      </section>

      {!loading && pagination.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>{pagination.total} student accounts</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="min-h-9 rounded-lg border border-slate-200 px-3 disabled:opacity-40">Previous</button>
            <span>Page {page} of {pagination.pages}</span>
            <button type="button" disabled={page >= pagination.pages} onClick={() => setPage((current) => current + 1)} className="min-h-9 rounded-lg border border-slate-200 px-3 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">Loading accounts...</p>
        ) : users.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <UserRound className="mx-auto size-9 text-slate-400" />
            <h2 className="mt-3 font-semibold text-slate-800">No student accounts found</h2>
            <p className="mt-1 text-sm text-slate-500">Try another search or status filter.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {users.map((user) => (
              <li key={user._id} className="space-y-3 px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-slate-900">{user.name}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {user.isActive ? "Active" : "Suspended"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{user.email}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {user.classLevel || "Class not set"} · Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => viewHistory(user)}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Status history
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReasonFor(reasonFor?._id === user._id ? null : user);
                        setReason("");
                      }}
                      className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold ${user.isActive ? "border border-red-200 text-red-700 hover:bg-red-50" : "bg-slate-900 text-white hover:bg-slate-700"}`}
                    >
                      {user.isActive ? <ShieldAlert className="size-4" /> : <ShieldCheck className="size-4" />}
                      {user.isActive ? "Suspend" : "Reactivate"}
                    </button>
                  </div>
                </div>

                {reasonFor?._id === user._id && (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      toggleStatus(user);
                    }}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <label htmlFor={`status-reason-${user._id}`} className="block text-sm font-medium text-slate-700">
                      Reason for {user.isActive ? "suspension" : "reactivation"}
                    </label>
                    <textarea
                      id={`status-reason-${user._id}`}
                      required
                      minLength={3}
                      maxLength={500}
                      rows={2}
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                    <div className="mt-3 flex justify-end gap-2">
                      <button type="button" onClick={() => setReasonFor(null)} className="min-h-9 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-white">
                        Cancel
                      </button>
                      <button type="submit" disabled={savingId === user._id} className="min-h-9 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50">
                        {savingId === user._id ? "Saving..." : "Confirm"}
                      </button>
                    </div>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {historyFor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setHistoryFor(null);
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="user-history-heading" className="max-h-[80vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="user-history-heading" className="text-lg font-bold text-slate-900">Account status history</h2>
                <p className="mt-1 text-sm text-slate-600">{historyFor.name} · {historyFor.email}</p>
              </div>
              <button type="button" onClick={() => setHistoryFor(null)} aria-label="Close status history" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <X className="size-5" />
              </button>
            </div>
            {history.length === 0 ? (
              <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No status changes have been recorded for this account.</p>
            ) : (
              <ol className="mt-5 space-y-3">
                {[...history].reverse().map((item, index) => (
                  <li key={`${item.changedAt}-${index}`} className="rounded-xl border border-slate-200 p-4">
                    <p className="font-semibold text-slate-900">{item.isActive ? "Reactivated" : "Suspended"}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.reason}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {item.changedBy?.name || "Administrator"} · {new Date(item.changedAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
