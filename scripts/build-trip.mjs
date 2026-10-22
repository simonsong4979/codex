// Zero npm dependencies. Run: node scripts/build-trip.mjs
import { trip, checklist } from '../tokyo-trip/itinerary.js';
import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = resolve(root, 'tokyo-trip');
const output = resolve(process.argv[2] || '/workspace/trip-release');
if (output === root || output === site) throw new Error('Choose an output directory outside the source site.');
const folder = resolve(output,'tokyo-trip');
mkdirSync(folder,{recursive:true});

const text = [
  `${trip.name}\n2027년 1월 4일–7일 · 3박 4일 · 3인 가족`,
  '모든 시각은 한국·일본 현지 시각(UTC+9)입니다. 모든 일정·예약·교통시간은 확정 전의 계획입니다. 가족 컨디션에 따라 조절하세요.',
  ...trip.days.map((day,i) => [
    `\nDAY ${i+1} · ${day.date} (${day.weekday}) · ${day.title}`,
    day.warning ? `확인 필요: ${day.warning}` : '',
    ...day.events.map((e) => `${e.time}${e.end ? `–${e.end}` : ' 이후'}  ${e.title}${e.place ? ` · ${e.place}` : ''}\n  ${e.mode}${e.note ? ` / ${e.note}` : ''}${e.booking ? ` / ${e.booking}` : ''}`)
  ].filter(Boolean).join('\n')),
  '\n원본 확인 사항: 둘째 날 제목의 오다이바는 별도 세부 일정이 없습니다. 저녁 식당의 아키하바라점·아사쿠사점 표기를 확인하세요.',
  '\n출발 준비',
  ...checklist.map((group) => `${group.title}\n${group.items.map(([,label]) => `[ ] ${label}`).join('\n')}`)
].join('\n\n')+'\n';
writeFileSync(resolve(site,'itinerary.txt'),text);
const files = ['index.html','styles.css','theme.css','theme.js','app.js','itinerary.js','sw.js','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png','itinerary.txt','_headers'];
for (const file of files) copyFileSync(resolve(site,file),resolve(folder,file));
// Ensure every offline URL exists in the published folder.
const sw = readFileSync(resolve(site,'sw.js'),'utf8');
for (const file of files.filter((name) => !['sw.js','_headers'].includes(name))) {
  if (!sw.includes(`'${file}'`)) throw new Error(`Offline asset missing in service worker: ${file}`);
}
const archive = resolve(output,'tokyo-trip.zip');
execFileSync('python',['-c',
  'import pathlib,sys,zipfile; root=pathlib.Path(sys.argv[1]); z=zipfile.ZipFile(sys.argv[2],"w",zipfile.ZIP_DEFLATED); [z.write(root/name,name) for name in sys.argv[3:]]; z.close()',
  folder,archive,...files
]);
const digest = createHash('sha256').update(readFileSync(archive)).digest('hex');
writeFileSync(resolve(output,'SHA256SUMS'),`${digest}  tokyo-trip.zip\n`);

// A second distribution works from a downloaded file or sandboxed preview:
// no module fetch, service worker registration, or external visual asset needed.
const svg = `data:image/svg+xml;base64,${readFileSync(resolve(site,'icon.svg')).toString('base64')}`;
const png = `data:image/png;base64,${readFileSync(resolve(site,'icon-192.png')).toString('base64')}`;
const dataCode = readFileSync(resolve(site,'itinerary.js'),'utf8').replace(/^export const /gm,'const ');
const appCode = readFileSync(resolve(site,'app.js'),'utf8').replace(/^import .*?;\s*/, '');
const inlineCode = `(() => {\n${dataCode}\n${appCode}\n})();`.replace(/<\/script/gi,'<\\/script');
const inlineCSS = readFileSync(resolve(site,'styles.css'),'utf8');
let standalone = readFileSync(resolve(site,'index.html'),'utf8')
  .replace('<html lang="ko">','<html lang="ko" data-mode="portable">')
  .replace('href="./icon.svg"',`href="${svg}"`)
  .replace('href="./icon-192.png"',`href="${png}"`)
  .replace(/\s*<link rel="manifest"[^>]+>/,'')
  .replace('<link rel="stylesheet" href="./styles.css">',()=>`<style>${inlineCSS}</style>`)
  .replace('<link rel="stylesheet" href="./theme.css">',()=>`<style>${readFileSync(resolve(site,'theme.css'),'utf8')}</style>`)
  .replace('<script src="./theme.js"></script>',()=>`<script>${readFileSync(resolve(site,'theme.js'),'utf8')}</script>`)
  .replace(/\s*<script type="module" src="\.\/app\.js"><\/script>/,'')
  .replace('<a href="./itinerary.txt">텍스트 일정표 보기</a>',()=>`<details><summary>텍스트 일정표 보기</summary><pre>${text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre></details>`)
  .replace('</body>',()=>`<script>${inlineCode}</script>\n</body>`);
writeFileSync(resolve(output,'tokyo-trip.html'),standalone);
console.log(`Ready: ${folder}\nZIP: ${archive}\nPortable: ${resolve(output,'tokyo-trip.html')}\n${trip.days.length} days, ${trip.days.reduce((n,d)=>n+d.events.length,0)} events, ${checklist.reduce((n,g)=>n+g.items.length,0)} checklist items\nSHA256: ${digest}`);
