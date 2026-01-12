type Pub = {
  year: number;
  title: string;
  venue: string;
  type: "포스터";
  note?: string;
};

const pubs: Pub[] = [
  {
    year: 2024,
    title:
      "아동기 정서적 방임 및 학대 경험이 대학생의 무쾌감증 및 우울에 미치는 영향: 불안정 애착의 매개효과",
    venue: "한국심리학회 연차학술대회(제78차), 서울",
    type: "포스터",
  },
  {
    year: 2025,
    title:
      "아동기 방임 및 학대 경험이 대학생의 무쾌감증 및 우울에 미치는 영향: 불안정 애착과 정서조절의 순차적 다중매개효과",
    venue: "한국심리학회 연차학술대회(제79차), 서울",
    type: "포스터",
  },
  {
    year: 2025,
    title:
      "Effects of childhood neglect and abuse experience on university students’ anhedonia and depression: The serial multiple mediation effect of insecure attachment and emotion regulation",
    venue: "American Psychological Association Annual Convention",
    type: "포스터",
    note: "영문 포스터 발표",
  },
];

export default function Publications() {
  const years = Array.from(new Set(pubs.map((p) => p.year))).sort((a, b) => b - a);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">발표/논문</h1>
        <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-200">
          CV에 기재된 학회 발표를 정리했습니다. :contentReference[oaicite:16]{index=16}
        </p>
      </header>

      {years.map((y) => (
        <section key={y} className="space-y-3">
          <div className="text-sm font-extrabold text-zinc-600 dark:text-zinc-300">{y}</div>
          <div className="space-y-3">
            {pubs.filter((p) => p.year === y).map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="text-base font-extrabold">{p.title}</div>
                <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">{p.venue}</div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                  <span className="rounded-full border border-zinc-200 px-2 py-1 dark:border-zinc-800">
                    {p.type}
                  </span>
                  {p.note ? (
                    <span className="rounded-full border border-zinc-200 px-2 py-1 dark:border-zinc-800">
                      {p.note}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
