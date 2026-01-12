const items = [
  {
    title: "다문화 상담심리",
    bullets: [
      "소수자 스트레스, 문화적 정체성, 낙인/차별이 정신건강과 적응에 미치는 영향",
      "문화적으로 반응적인 상담 중재 및 다문화 상담역량 개발",
    ],
  },
  {
    title: "다문화 맥락에서의 심리적 적응과 웰빙",
    bullets: [
      "정서조절, 애착 경험, 주관적 안녕감의 문화·맥락 차이",
      "적응 과정과 보호·위험요인의 경험적 검증",
    ],
  },
  {
    title: "진로 집단상담 프로그램 개발/평가",
    bullets: [
      "이론 기반 설계 및 회기 구성",
      "진로 관련 변인을 중심으로 효과 평가",
    ],
  },
];

export default function Research() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">연구 관심</h1>
        <p className="max-w-2xl text-sm leading-6 text-zinc-700 dark:text-zinc-200">
          CV에 정리된 관심 분야를 사이트용으로 보기 좋게 정리했습니다.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((it) => (
          <div
            key={it.title}
            className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="text-base font-extrabold">{it.title}</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200">
              {it.bullets.map((b) => (
                <li key={b}>• {b}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
