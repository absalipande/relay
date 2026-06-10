export function AuthHero() {
  const columns = [
    {
      name: "To do",
      count: 4,
      accent: "bg-[#007AFF]",
      cards: [
        { title: "Draft launch plan", tag: "Planning", avatar: "AP" },
        { title: "Review task schema", tag: "Database", avatar: "MS" },
        { title: "Set up analytics events", tag: "Analytics", avatar: "DK" },
      ],
    },
    {
      name: "In progress",
      count: 3,
      accent: "bg-amber-400",
      cards: [
        { title: "Build auth flow", tag: "Frontend", avatar: "JL" },
        { title: "Invite teammates", tag: "Growth", avatar: "RK" },
        { title: "Apply RLS rules", tag: "Security", avatar: "NP" },
      ],
    },
    {
      name: "Done",
      count: 6,
      accent: "bg-emerald-400",
      cards: [
        { title: "Create workspace", tag: "Core", avatar: "SA" },
        { title: "Design system update", tag: "Design", avatar: "MV" },
        { title: "Project kickoff", tag: "Planning", avatar: "LC" },
      ],
    },
  ];

  return (
    <section className="relative hidden min-h-full overflow-hidden bg-[#f7faff] px-12 py-10 lg:flex lg:flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,#ffffff_0,#f7faff_42%,#eaf1fb_100%)]" />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-[#dbe6f6]/70 blur-3xl" />
      <div className="absolute bottom-[-44px] right-[-30px] h-52 w-72 rounded-[44px] bg-slate-700/20 blur-2xl" />
      <div className="absolute bottom-0 left-0 h-60 w-full bg-gradient-to-t from-[#dfe9f7]/70 to-transparent" />
      <div className="absolute bottom-0 left-0 h-48 w-48">
        <div className="absolute bottom-0 left-10 h-24 w-28 rounded-t-full bg-white/80 shadow-xl shadow-slate-900/5" />
        <div className="absolute bottom-20 left-10 h-24 w-6 origin-bottom -rotate-12 rounded-full bg-emerald-700/40" />
        <div className="absolute bottom-24 left-20 h-28 w-7 origin-bottom rotate-12 rounded-full bg-emerald-800/35" />
        <div className="absolute bottom-18 left-28 h-20 w-6 origin-bottom rotate-45 rounded-full bg-emerald-700/35" />
      </div>
      <div className="absolute bottom-0 right-6 h-28 w-72 rounded-t-[28px] bg-slate-700 shadow-2xl shadow-slate-900/20">
        <div className="absolute left-1/2 top-8 h-10 w-10 -translate-x-1/2">
          <img src="/relay-logo.svg" alt="" className="h-full w-auto opacity-90" />
        </div>
      </div>
      <div className="absolute bottom-0 right-0 h-16 w-28 rounded-t-2xl bg-[#315fd8]/85 shadow-xl shadow-blue-900/20" />

      <div className="relative z-10 flex items-center gap-3">
        <img src="/relay-logo.svg" alt="" className="h-10 w-auto" />
        <span className="text-2xl font-semibold tracking-tight text-slate-950">
          relay
        </span>
      </div>

      <div className="relative z-10 my-auto max-w-[540px]">
        <h1 className="text-[44px] font-semibold leading-[1.08] tracking-tight text-slate-950">
          Plan. Track. Deliver.
          <span className="block text-[#315fd8]">All in one place.</span>
        </h1>
        <p className="mt-5 max-w-md text-lg leading-8 text-slate-600">
          Relay helps teams stay aligned, manage projects, and deliver results
          faster.
        </p>

        <div className="mt-10 w-[min(650px,calc(100vw-96px))] rounded-3xl border border-white bg-white/75 p-3.5 shadow-2xl shadow-slate-900/10 backdrop-blur">
          <div className="grid grid-cols-[72px_1fr] overflow-hidden rounded-2xl border border-slate-100 bg-white">
            <div className="flex flex-col items-center gap-7 bg-[#315fd8] py-7">
              <img src="/relay-logo.svg" alt="" className="h-8 w-auto brightness-0 invert" />
              <span className="grid h-7 w-7 place-items-center rounded-md border border-white/35 text-white/90">
                <GridIcon />
              </span>
              <span className="grid h-7 w-7 place-items-center rounded-md border border-white/35 text-white/90">
                <CheckIcon />
              </span>
              <span className="grid h-7 w-7 place-items-center rounded-md border border-white/35 text-white/90">
                <CalendarIcon />
              </span>
              <span className="grid h-7 w-7 place-items-center rounded-md border border-white/35 text-white/90">
                <ChartIcon />
              </span>
            </div>

            <div className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-slate-950">
                    Project Launch
                  </p>
                  <span className="text-sm text-slate-400">⌄</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {["AP", "JL", "SA"].map((avatar) => (
                      <span
                        key={avatar}
                        className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-slate-900 text-[9px] font-semibold text-white"
                      >
                        {avatar}
                      </span>
                    ))}
                    <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-semibold text-slate-500">
                      +2
                    </span>
                  </div>
                  <span className="rounded-lg bg-[#315fd8] px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-900/10">
                    + New task
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {columns.map((column) => (
                  <div key={column.name} className="rounded-2xl bg-slate-50/80 p-3.5">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-700">
                        {column.name}
                      </p>
                      <span className="rounded-full bg-slate-200 px-2 text-xs text-slate-500">
                        {column.count}
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {column.cards.map((card) => (
                        <div key={card.title} className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200/70">
                          <div className={`h-1.5 w-12 rounded-full ${column.accent}`} />
                          <p className="mt-3 min-h-8 text-xs font-semibold leading-4 text-slate-800">
                            {card.title}
                          </p>
                          <div className="mt-3 flex items-center justify-between gap-2">
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
                              {card.tag}
                            </span>
                            <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-[9px] font-semibold text-white">
                              {card.avatar}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GridIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path d="M5 5h5v5H5V5Zm9 0h5v5h-5V5ZM5 14h5v5H5v-5Zm9 0h5v5h-5v-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path d="M5.5 12.5 10 17l8.5-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 5h14v14H5V5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path d="M6 7h12v12H6V7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 5v4m8-4v4M6 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path d="M6 18V11m6 7V6m6 12v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
