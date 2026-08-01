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
    <section className="pt-10 mx-auto max-w-screen-xl pb-4 px-4 sm:px-8">
      <div className="max-w-screen-xl text-center">
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
                    <svg
                      viewBox="0 0 1200 1227"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                    >
                      <path
                        fill="white"
                        d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"
                      />
                    </svg>
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
