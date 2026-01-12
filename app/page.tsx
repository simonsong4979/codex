function Card({
  title,
  desc,
  href,
  tag,
}: {
  title: string;
  desc: string;
  href: string;
  tag: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 no-underline"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
            {tag}
          </div>
          <div className="mt-1 text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </div>
        </div>
        <div className="text-zinc-400 transition group-hover:text-zinc-700 dark:group-hover:text-zinc-200">
          →
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-200">
        {desc}
      </p>
    </a>
  );
}

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          상담심리학과 학부생 · 2027년 2월 졸업 예정
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          송대한 연구 포트폴리오
        </h1>

        <p className="max-w-2xl text-base leading-7 text-zinc-700 dark:text-zinc-200">
          다문화·소수자 스트레스, 정체성/낙인/차별과 정신건강, 그리고 문화적으로 반응적인 상담 중재에 관심이 있습니다.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="/publications"
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:opacity-90 dark:bg-white dark:text-zinc-900 no-underline"
          >
            발표/논문 보기
          </a>
          <a
            href="/awards"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-extrabold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 no-underline"
          >
            수상 보기
          </a>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card tag="PROFILE" title="소개" desc="학력, 기본 정보, 간단 소개" href="/about" />
        <Card tag="RESEARCH" title="연구 관심" desc="관심 분야와 연구 질문" href="/research" />
        <Card tag="OUTPUTS" title="발표/논문" desc="KPA/APA 포스터 발표 등" href="/publications" />
        <Card tag="CONTACT" title="연락" desc="이메일/연락처" href="/contact" />
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-extrabold tracking-tight">핵심 요약</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200">
          <li>• 전공: 차의과학대학교 상담심리학과(학부)</li>
          <li>• 관심: 다문화 상담심리, 소수자 스트레스, 정체성/낙인/차별, 적응과 웰빙</li>
          <li>• 산출물: 한국심리학회/미국심리학회 포스터 발표</li>
        </ul>
      </section>
    </div>
  );
}
