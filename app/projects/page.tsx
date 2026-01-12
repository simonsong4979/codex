"use client";

import { useMemo, useState } from "react";

type Project = {
  title: string;
  desc: string;
  tags: string[];
  period: string;
  role: string;
};

const projects: Project[] = [
  {
    title: "ABMT 모바일 앱 기반 중재 연구",
    desc: "훈련 전후 사회불안 척도 및 EEG/HRV 지표 변화를 분석.",
    tags: ["Digital", "EEG", "HRV"],
    period: "2025–2026",
    role: "Design / Data / Analysis",
  },
  {
    title: "멘토링 프로그램 효과 분석",
    desc: "현장 기록을 기반으로 개입 내용과 변화를 정리.",
    tags: ["Counseling", "Program"],
    period: "2025",
    role: "Facilitation / Reflection",
  },
];

function TagButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1 text-xs font-medium",
        active
          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export default function Projects() {
  const allTags = useMemo(() => {
    const s = new Set<string>();
    projects.forEach((p) => p.tags.forEach((t) => s.add(t)));
    return ["All", ...Array.from(s)];
  }, []);

  const [selected, setSelected] = useState("All");

  const filtered = useMemo(() => {
    if (selected === "All") return projects;
    return projects.filter((p) => p.tags.includes(selected));
  }, [selected]);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          태그로 필터링하면서 프로젝트를 볼 수 있습니다.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {allTags.map((t) => (
          <TagButton
            key={t}
            label={t}
            active={selected === t}
            onClick={() => setSelected(t)}
          />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="text-lg font-semibold tracking-tight">{p.title}</div>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              {p.desc}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="rounded-full border border-zinc-200 px-2 py-1 dark:border-zinc-800">
                {p.period}
              </span>
              <span className="rounded-full border border-zinc-200 px-2 py-1 dark:border-zinc-800">
                {p.role}
              </span>
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-zinc-200 px-2 py-1 dark:border-zinc-800"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
