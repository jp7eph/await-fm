import { XIcon } from "./icons";

interface Host {
  name: string;
  role: string;
  x: string;
  img: string;
}

const hosts: Host[] = [
  {
    name: "naoe",
    role: "Infrastructure Engineer",
    x: "https://x.com/jp7eph",
    img: "/img/naoe.jpg",
  },
  {
    name: "okamo",
    role: "Software Engineer",
    x: "https://x.com/aoirohn",
    img: "/img/okamo.jpg",
  },
];

export function Hosts() {
  return (
    <section className="pt-10 mx-auto max-w-7xl pb-4 px-4 sm:px-8">
      <div className="max-w-7xl text-center">
        <h3 className="text-gray-800 text-3xl font-semibold md:text-4xl">Radio host</h3>
        <div className="mt-4 max-w-xl mx-auto">
          <ul className="grid gap-8 md:grid-cols-2">
            {hosts.map((host) => (
              <li key={host.name}>
                <div className="w-20 h-20 mx-auto">
                  <img src={host.img} className="w-full h-full rounded-full" alt={host.name} />
                </div>
                <div className="mt-2">
                  <h4 className="text-gray-700 font-semibold">{host.name}</h4>
                  <p className="text-indigo-600">{host.role}</p>
                  <a
                    href={host.x}
                    className="inline-flex items-center gap-2 mt-2 px-3 py-3 text-white duration-150 bg-gray-900 rounded-lg hover:bg-gray-800 active:bg-gray-700"
                  >
                    <XIcon className="w-4 h-4" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
