import { useEffect, useMemo, useState, type ReactNode } from "react";
import useRemote from "../../hooks/useRemote";
import { getErrorMessage } from "../../service/errorMessage";
import DataTable, { type ColumnDef, RowButton } from "./DataTable";
import RecordFormModal, { type RecordFormField, type RecordFormPayload, type SaveResult } from "./RecordFormModal";
import ConfirmDialog from "./ConfirmDialog";
import Notice from "./Notice";

export interface CrudToggle<T extends object> {
  field?: keyof T;
  isOn?: (row: T) => boolean;
  onLabel: string;
  offLabel: string;
  run: (row: T) => Promise<{ data?: Partial<T>; message?: string }>;
}

export interface CrudApi<T extends object> {
  create: (data: RecordFormPayload) => Promise<{ message?: string }>; 
  update: (id: string, data: RecordFormPayload) => Promise<{ message?: string }>; 
  remove: (id: string) => Promise<{ message?: string }>;
}

interface CrudPageProps<T extends object> {
  title: string;
  subtitle: string;
  noun: string;
  plural: string;
  fetcher: () => Promise<{ data: T[] }>;
  api: CrudApi<T>;
  columns: ColumnDef<T>[];
  fields: RecordFormField[];
  searchText: (row: T) => string;
  rowName: (row: T) => string;
  toggle?: CrudToggle<T>;
  validate?: (values: RecordFormPayload, editing: boolean) => Record<string, string>;
  buildPayload?: (body: RecordFormPayload, values: RecordFormPayload, editing: boolean) => RecordFormPayload;
  emptyText?: string;
  deleteNote?: string;
  summary?: (rows: T[]) => string;
  renderView?: (row: T, close: () => void) => ReactNode;
}

// One list page with search, add / edit dialog, delete confirmation and an
// optional on/off toggle. Each admin page (movies, cinemas, ...) is a small config.
export default function CrudPage<T extends object>({
  title, subtitle, noun, plural, fetcher, api, columns, fields, searchText, rowName,
  toggle, validate, buildPayload, emptyText, deleteNote, summary, renderView,
}: CrudPageProps<T>) {
  const { status, data, error, reload, mutate } = useRemote<T[]>(fetcher, `Could not load the ${plural}.`);

  const [search, setSearch] = useState("");
  const [form, setForm] = useState<{ record: T | null } | null>(null);
  const [viewing, setViewing] = useState<T | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<T | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

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

  const handleSaved = (message: string) => {
    setForm(null);
    setNotice({ tone: "success", text: message });
    reload();
  };

  const runToggle = async (row: T) => {
    const rowId = String((row as { _id?: string })._id ?? "");
    setBusyId(rowId);
    try {
      if (!toggle) return;
      const res = await toggle.run(row);
      mutate((list: T[] = []) => list.map((r) => (String((r as { _id?: string })._id ?? "") === rowId ? { ...r, ...res.data } : r)));
      setNotice({ tone: "success", text: res.message || "Updated." });
    } catch (err) {
      setNotice({ tone: "error", text: getErrorMessage(err, "That action failed. Please try again.") });
    } finally {
      setBusyId(null);
    }
  };

  const runDelete = async () => {
    const row = confirmDelete;
    if (!row) return;
    const rowId = String((row as { _id?: string })._id ?? "");
    setBusyId(rowId);
    try {
      const res = await api.remove(rowId);
      mutate((list: T[] = []) => list.filter((r) => String((r as { _id?: string })._id ?? "") !== rowId));
      setNotice({ tone: "success", text: res.message || `${noun} deleted.` });
    } catch (err) {
      setNotice({ tone: "error", text: getErrorMessage(err, "Could not delete. Please try again.") });
    } finally {
      setBusyId(null);
      setConfirmDelete(null);
    }
  };

  const isOn = (row: T) => (toggle?.isOn ? toggle.isOn(row) : Boolean((row as Record<string, unknown>)[toggle?.field as string]));

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
              {renderView && <RowButton onClick={() => setViewing(row)} disabled={busyId === String((row as { _id?: string })._id ?? "")}>View</RowButton>}
              <RowButton onClick={() => setForm({ record: row })} disabled={busyId === String((row as { _id?: string })._id ?? "")}>Edit</RowButton>
              {toggle && (
                <RowButton tone={isOn(row) ? "warn" : "ok"} onClick={() => runToggle(row)} disabled={busyId === String((row as { _id?: string })._id ?? "")}>
                  {isOn(row) ? toggle.offLabel : toggle.onLabel}
                </RowButton>
              )}
              <RowButton tone="danger" onClick={() => setConfirmDelete(row)} disabled={busyId === String((row as { _id?: string })._id ?? "")}>Delete</RowButton>
            </>
          )}
        />
      </section>

      {viewing && renderView?.(viewing, () => setViewing(null))}

      {form && (
        <RecordFormModal
          noun={noun}
          fields={fields}
          record={form.record as Record<string, unknown> | null}
          validate={validate}
          buildPayload={buildPayload}
          onSave={(body) => (form.record ? api.update(String((form.record as { _id?: string })._id ?? ""), body) : api.create(body))}
          onSaved={handleSaved}
          onClose={() => setForm(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title={`Delete this ${noun.toLowerCase()}?`}
          message={`“${rowName(confirmDelete)}” will be permanently removed. ${deleteNote ?? "This cannot be undone."}`}
          confirmLabel={`Delete ${noun.toLowerCase()}`}
          busy={busyId === String((confirmDelete as { _id?: string })._id ?? "")}
          onConfirm={runDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}