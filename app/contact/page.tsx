export default function Contact() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">연락</h1>
        <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-200">
          아래 정보로 연락할 수 있습니다.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-base font-extrabold">이메일</h2>
          <a
            className="mt-3 inline-block rounded-xl bg-zinc-900 px-4 py-2 text-sm font-extrabold text-white no-underline hover:opacity-90 dark:bg-white dark:text-zinc-900"
            href="mailto:sdh4979@gmail.com"
          >
            sdh4979@gmail.com
          </a>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-base font-extrabold">전화</h2>
          <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-200">
            +82-10-7574-4979
          </p>
        </div>
      </div>
    </div>
  );
}
