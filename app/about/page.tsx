export default function About() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">소개</h1>
        <p className="max-w-2xl text-sm leading-6 text-zinc-700 dark:text-zinc-200">
          송대한(상담심리학과 학부생) 기본 정보와 학력을 정리합니다.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-base font-extrabold">기본 정보</h2>
          <div className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-200">
            <div>
              <span className="font-bold">이메일:</span> sdh4979@gmail.com
            </div>
            <div>
              <span className="font-bold">전화:</span> +82-10-7574-4979
            </div>
            <div>
              <span className="font-bold">졸업 예정:</span> 2027년 2월
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-base font-extrabold">학력</h2>
          <div className="mt-3 space-y-3 text-sm text-zinc-700 dark:text-zinc-200">
            <div>
              <div className="font-bold">차의과학대학교 상담심리학과 (2022.03 ~ 현재)</div>
              <div className="text-zinc-600 dark:text-zinc-300">
                GPA 3.73/4.5 (전공 3.68)
              </div>
            </div>
            <div>
              <div className="font-bold">남강고등학교 (2019.03 ~ 2022.02)</div>
              <div className="text-zinc-600 dark:text-zinc-300">졸업</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
