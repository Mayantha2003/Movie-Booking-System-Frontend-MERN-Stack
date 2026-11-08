import { useEffect, useMemo, useState } from "react";
import useRemote from "../../hooks/useRemote";
import { getErrorMessage } from "../../service/errorMessage";
import DataTable, { RowButton } from "./DataTable";
import RecordFormModal from "./RecordFormModal";
import ConfirmDialog from "./ConfirmDialog";
import Notice from "./Notice";

// One list page with search, add / edit dialog, delete confirmation and an
// optional on/off toggle. Each admin page (movies, cinemas, ...) is a small config.
//
//   fetcher            module-level function returning the list ({ data: [...] })
//   api                { create(body), update(id, body), remove(id) }
//   toggle             { field | isOn(row), onLabel, offLabel, run(row) } optional on/off button
//   renderView         (row, close) => modal, adds a View button
//   searchText(row)    text the search box looks in
//   rowName(row)       name shown in the delete confirmation
export default function CrudPage({
  title, subtitle, noun, plural, fetcher, api, columns, fields, searchText, rowName,
  toggle, validate, buildPayload, emptyText, deleteNote, summary, renderView,
}) {
  const { status, data, error, reload, mutate } = useRemote(fetcher, `Could not load the ${plural}.`);

  const [search, setSearch] = useState("");
  const [form, setForm] = useState(null); // { record } — record null means "add"
  const [viewing, setViewing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (notice?.tone !== "success") return undefined;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const rows = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? rows.filter((r) => searchText(r).toLowerCase().includes(q)) : rows;
  }, [rows, search, searchText]);

  const handleSaved = (message) => {
    setForm(null);
    setNotice({ tone: "success", text: message });
    reload();
  };

  const runToggle = async (row) => {
    setBusyId(row._id);
    try {
      const res = await toggle.run(row);
      mutate((list) => list.map((r) => (r._id === row._id ? { ...r, ...res.data } : r)));
      setNotice({ tone: "success", text: res.message || "Updated." });
    } catch (err) {
      setNotice({ tone: "error", text: getErrorMessage(err, "That action failed. Please try again.") });
    } finally {
      setBusyId(null);
    }
  };

  const runDelete = async () => {
    const row = confirmDelete;
    setBusyId(row._id);
    try {
      const res = await api.remove(row._id);
      mutate((list) => list.filter((r) => r._id !== row._id));
      setNotice({ tone: "success", text: res.message || `${noun} deleted.` });
    } catch (err) {
      setNotice({ tone: "error", text: getErrorMessage(err, "Could not delete. Please try again.") });
    } finally {
      setBusyId(null);
      setConfirmDelete(null);
    }
  };

  const isOn = (row) => (toggle?.isOn ? toggle.isOn(row) : Boolean(row[toggle?.field]));

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-gray-400">{subtitle}</p>
        </div>
        <button type="button" onClick={() => setForm({ record: null })}
          className="h-11 w-full rounded-lg bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-500 sm:w-auto">
          + Add {noun.toLowerCase()}
        </button>
      </div>

      {notice && (
        <div className="mb-6">
          <Notice tone={notice.tone} onClose={() => setNotice(null)}>{notice.text}</Notice>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold">All {plural}</h2>
            <p className="mt-1 text-sm text-gray-400">
              {status === "ready" ? summary?.(rows) ?? `${rows.length} in total` : "Loading…"}
            </p>
          </div>
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${plural}`} aria-label={`Search ${plural}`}
            className="h-11 w-full rounded-lg border border-white/10 bg-[#0b0f19] px-3.5 text-sm text-white placeholder:text-gray-500 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 sm:w-72" />
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          status={status}
          error={error}
          onRetry={reload}
          filtered={Boolean(search.trim())}
          emptyTitle={`No ${plural} yet`}
          emptyText={emptyText ?? `Use “Add ${noun.toLowerCase()}” to create the first one.`}
          actions={(row) => (
            <>
              {renderView && <RowButton onClick={() => setViewing(row)} disabled={busyId === row._id}>View</RowButton>}
              <RowButton onClick={() => setForm({ record: row })} disabled={busyId === row._id}>Edit</RowButton>
              {toggle && (
                <RowButton tone={isOn(row) ? "warn" : "ok"} onClick={() => runToggle(row)} disabled={busyId === row._id}>
                  {isOn(row) ? toggle.offLabel : toggle.onLabel}
                </RowButton>
              )}
              <RowButton tone="danger" onClick={() => setConfirmDelete(row)} disabled={busyId === row._id}>Delete</RowButton>
            </>
          )}
        />
      </section>

      {viewing && renderView(viewing, () => setViewing(null))}

      {form && (
        <RecordFormModal
          noun={noun}
          fields={fields}
          record={form.record}
          validate={validate}
          buildPayload={buildPayload}
          onSave={(body) => (form.record ? api.update(form.record._id, body) : api.create(body))}
          onSaved={handleSaved}
          onClose={() => setForm(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title={`Delete this ${noun.toLowerCase()}?`}
          message={`“${rowName(confirmDelete)}” will be permanently removed. ${deleteNote ?? "This cannot be undone."}`}
          confirmLabel={`Delete ${noun.toLowerCase()}`}
          busy={busyId === confirmDelete._id}
          onConfirm={runDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}