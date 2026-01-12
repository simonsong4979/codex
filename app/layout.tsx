import "./globals.css";
import ThemeToggle from "./components/ThemeToggle";

export const metadata = {
  title: "송대한 | 연구 포트폴리오",
  description: "상담심리학 연구 포트폴리오",
};

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white no-underline hover:underline"
    >
      {label}
    </a>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/80 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/70">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <a href="/" className="font-extrabold tracking-tight no-underline">
              송대한 · Research Portfolio
            </a>

            <nav className="hidden items-center gap-5 sm:flex">
              <NavLink href="/about" label="소개" />
              <NavLink href="/research" label="연구관심" />
              <NavLink href="/publications" label="발표/논문" />
              <NavLink href="/awards" label="수상" />
              <NavLink href="/contact" label="연락" />
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <a
                href="/contact"
                className="rounded-xl bg-zinc-900 px-3 py-2 text-xs font-bold text-white no-underline hover:opacity-90 dark:bg-white dark:text-zinc-900"
              >
                연락하기
              </a>
            </div>
          </div>

          <div className="mx-auto max-w-5xl px-4 pb-3 sm:hidden">
            <div className="flex flex-wrap gap-3">
              <NavLink href="/about" label="소개" />
              <NavLink href="/research" label="연구관심" />
              <NavLink href="/publications" label="발표/논문" />
              <NavLink href="/awards" label="수상" />
              <NavLink href="/contact" label="연락" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>

        <footer className="border-t border-zinc-200/70 py-8 text-sm text-zinc-600 dark:border-zinc-800/70 dark:text-zinc-300">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4">
            <div>© {new Date().getFullYear()} 송대한</div>
            <div className="flex flex-wrap gap-4">
              <span className="font-semibold">Email:</span>
              <a className="no-underline hover:underline" href="mailto:sdh4979@gmail.com">
                sdh4979@gmail.com
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
