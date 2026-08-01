import { EpisodeList } from "./components/EpisodeList";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hosts } from "./components/Hosts";

export function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <Header />
        <Hosts />
        <EpisodeList />
      </div>
      <Footer />
    </div>
  );
}
