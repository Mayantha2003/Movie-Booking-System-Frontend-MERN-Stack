
import CrudPage from "../../components/dashboard/CrudPage";
import Badge from "../../components/dashboard/Badge";
import Thumb from "../../components/dashboard/Thumb";
import { formatDate } from "../../components/dashboard/format";
import type { FormField } from "../../components/dashboard/form";
import type { ColumnDef } from "../../components/dashboard/DataTable";
import { getMovies, movieApi } from "../../service/admin";
import { getYouTubeId } from "../../utils/media";
import type { Movie } from "../../types/api";

const STATUS = [
  { value: "now_showing", label: "Now showing" },
  { value: "coming_soon", label: "Coming soon" },
];

const fields: FormField[] = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea", required: true },
  { name: "genre", label: "Genres", type: "list", required: true, half: true, placeholder: "Action, Drama" },
  { name: "language", label: "Language", type: "text", required: true, half: true, placeholder: "English" },
  { name: "duration", label: "Duration (minutes)", type: "number", required: true, half: true, min: 1, integer: true },
  { name: "release_date", label: "Release date", type: "date", required: true, half: true },
  { name: "status", label: "Status", type: "select", options: STATUS, required: true, half: true, defaultValue: "coming_soon" },
  { name: "director", label: "Director", type: "text", required: true, half: true },
  { name: "rating", label: "Rating (0–10)", type: "number", half: true, min: 0, max: 10, step: "0.1" },
  { name: "cast", label: "Cast", type: "list", half: true, placeholder: "Actor one, Actor two" },

  { name: "poster", label: "Poster image", type: "image", kind: "poster", required: true, half: true, hint: "JPG, PNG or WebP, up to 5 MB. Portrait 2:3 works best." },
  { name: "banner", label: "Banner image", type: "image", kind: "banner", half: true, hint: "Wide 16:9 image shown behind the Home hero." },
  { name: "trailer_url", label: "Trailer (YouTube link)", type: "url", placeholder: "https://www.youtube.com/watch?v=…" },
];

const columns: ColumnDef<Movie>[] = [
  {
    key: "title", header: "Movie",
    render: (m: Movie) => (
      <div className="flex min-w-0 items-center gap-3">
        <Thumb src={m.poster} alt="" className="h-14 w-10 rounded-md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{m.title}</p>
          <p className="truncate text-xs text-gray-400">{m.director}</p>
        </div>
      </div>
    ),
  },
  { key: "genre", header: "Genre", render: (m: Movie) => (m.genre ?? []).join(", ") || "—" },
  { key: "language", header: "Language", render: (m: Movie) => m.language },
  { key: "duration", header: "Duration", render: (m: Movie) => `${m.duration} min`, className: "whitespace-nowrap" },
  { key: "release", header: "Release", render: (m: Movie) => formatDate(m.release_date), className: "whitespace-nowrap" },
  {
    key: "status", header: "Status",
    render: (m: Movie) => (m.status === "now_showing" ? <Badge tone="green">Now showing</Badge> : <Badge tone="blue">Coming soon</Badge>),
  },
];

const validate = (v: Record<string, unknown>): Record<string, string> => {
  const trailer = String(v.trailer_url ?? "").trim();
  return trailer && !getYouTubeId(trailer) ? { trailer_url: "Enter a valid YouTube link." } : {};
};

const searchText = (m: Movie) => [m.title, m.director, m.language, ...(m.genre ?? [])].join(" ");

export default function Movies() {
  return (
    <CrudPage
      title="Movies" subtitle="Add titles, set what is now showing and what is coming soon."
      noun="Movie" plural="movies"
      fetcher={getMovies} api={movieApi}
      columns={columns} fields={fields} validate={validate}
      searchText={searchText} rowName={(m: Movie) => m.title}
      summary={(rows: Movie[]) => `${rows.filter((m) => m.status === "now_showing").length} now showing · ${rows.length} in total`}
      deleteNote="Its showtimes and past bookings keep pointing to it, so check them first."
    />
  );
}
