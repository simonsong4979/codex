const awards = [
  {
    date: "2024.11",
    title: "제6회 임상상담심리 가을학술제 우수상",
    org: "차의과학대학교 상담심리학과",
  },
  {
    date: "2024.11",
    title: "제6회 임상상담심리 가을학술제 최우수상(Grand Prize)",
    org: "차의과학대학교 상담심리학과",
  },
  {
    date: "2024.12.27",
    title: "인성공유학교 운영지원 유공 표창(표창장)",
    org: "경기도용인교육지원청",
  },
  {
    date: "2025.11",
    title: "제7회 임상상담심리 가을학술제 최우수상(Grand Prize)",
    org: "차의과학대학교 상담심리학과",
  },
  {
    date: "2025.12.29",
    title: "꿈샘 멘토단 위(Wee)프로젝트 운영 및 지원 유공 표창(표창장)",
    org: "경기도성남교육지원청",
  },
];

export default function Awards() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">수상/표창</h1>
        <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-200">
          CV에 기재된 수상 내역입니다.
        </p>
      </header>

      <div className="space-y-3">
        {awards.map((a) => (
          <div
            key={`${a.date}-${a.title}`}
            className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="text-sm font-extrabold text-zinc-600 dark:text-zinc-300">
              {a.date}
            </div>
            <div className="mt-1 text-base font-extrabold">{a.title}</div>
            <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
              {a.org}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
