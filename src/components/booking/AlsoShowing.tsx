import useRemote from "../../hooks/useRemote";
import { getNowShowing } from "../../service/movie";
import MovieCard, { type MovieCardItem } from "../movie/MovieCard";

const mapMovie = (movie: MovieCardItem & { _id?: string }): MovieCardItem => ({
  ...movie,
  id: movie.id ?? movie._id,
  genres: movie.genres ?? movie.genre ?? [],
});

interface AlsoShowingProps {
  currentId?: string;
}

export default function AlsoShowing({ currentId }: AlsoShowingProps) {
  const { status, data } = useRemote(getNowShowing, "Could not load movies.");
  if (status !== "ready") return null;

  const movies = (data || [])
    .filter((m: any) => m._id !== currentId)
    .slice(0, 6)
    .map(mapMovie);

  if (movies.length === 0) return null;

  return (
    <section className="mx-auto mt-14 max-w-[1200px] px-4 sm:px-6" aria-labelledby="also-showing">
      <h2 id="also-showing" className="mb-6 text-2xl font-extrabold">Also showing</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id ?? movie._id} movie={movie} />
        ))}
      </div>
    </section>
  );
}
