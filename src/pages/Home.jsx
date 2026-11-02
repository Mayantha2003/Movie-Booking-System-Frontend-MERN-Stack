import { useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import HeroSection from "../components/movie/HeroSection";
import QuickBook from "../components/home/QuickBook";
import NowShowing from "../components/home/NowShowing";
import ComingSoon from "../components/home/ComingSoon";
import { MOVIES } from "../data/movies";

const Home = () => {
  const [search, setSearch] = useState("");

  const term = search.trim().toLowerCase();
  const matches = (m) => !term || m.title.toLowerCase().includes(term);

  const nowShowing = MOVIES.filter((m) => m.status === "now" && matches(m));
  const comingSoon = MOVIES.filter((m) => m.status === "soon" && matches(m));
  const heroMovies = MOVIES.filter((m) => m.status === "now").slice(0, 2);

  return (
    <div className="min-h-screen bg-white font-sans text-[#1E293B]">
      <Navbar search={search} setSearch={setSearch} />
      <HeroSection movies={heroMovies} />
      <QuickBook movies={nowShowing} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        <NowShowing movies={nowShowing} />
      </main>

      <ComingSoon movies={comingSoon} />
      <Footer />
    </div>
  );
};

export default Home;