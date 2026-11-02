const MoviePoster = ({ movie, className = "" }) => {
  if (movie.poster) {
    return (
      <img
        src={movie.poster}
        alt={`${movie.title} poster`}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-[#C8102E] to-[#7F0A1E] p-4 text-center text-lg font-extrabold text-white ${className}`}
    >
      {movie.title}
    </div>
  );
};

export default MoviePoster;