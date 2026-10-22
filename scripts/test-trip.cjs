// Environment validation: uses the preinstalled Playwright and system Chromium.
// Run from repository root: node scripts/test-trip.cjs
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const site = path.resolve(process.env.TRIP_SITE_DIR || path.join(__dirname,'../tokyo-trip'));
const artifacts = '/workspace/trip-release/checks';
fs.mkdirSync(artifacts,{recursive:true});
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.txt':'text/plain; charset=utf-8'};
const headers = Object.fromEntries(fs.readFileSync(path.join(site,'_headers'),'utf8').split('\n').filter((line)=>line.startsWith('  ') && line.includes(':')).map((line)=>{const i=line.indexOf(':');return [line.slice(0,i).trim(),line.slice(i+1).trim()];}));
const server = http.createServer((req,res)=>{
  let pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if (pathname.startsWith('/nested/tokyo-trip/')) pathname = pathname.slice('/nested/tokyo-trip'.length);
  const file = path.resolve(site,`.${pathname.endsWith('/') ? pathname+'index.html' : pathname}`);
  if (!file.startsWith(site+path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)] || 'application/octet-stream',...headers});
  res.end(fs.readFileSync(file));
});

(async()=>{
  await new Promise((resolve)=>server.listen(0,'127.0.0.1',resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const failures = [];
  let checks = 0;
  const pass = (label)=>{checks++;console.log(`PASS ${label}`);};
  try {
    const context = await browser.newContext({viewport:{width:390,height:844},locale:'ko-KR',timezoneId:'America/Los_Angeles',deviceScaleFactor:1});
    const page = await context.newPage();
    page.on('pageerror',(e)=>failures.push(e.message));
    page.on('console',(message)=>{if(message.type()==='error') failures.push(message.text());});
    await page.goto(origin+'/',{waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.querySelectorAll('.event').length===11);
    assert.match(await page.title(),/도쿄, 우리 함께/);
    assert.equal(await page.getByRole('tab').count(),4);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    pass('390px mobile: rendered title, first-day 11 events, 4 tabs, no horizontal overflow');

    await page.waitForFunction(()=>document.querySelector('#connection-status').textContent.includes('저장 완료'),{},{timeout:15000});
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
    pass('service worker controls page, full offline cache installed under production CSP');
    await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});
    await page.screenshot({path:path.join(artifacts,'mobile.png'),fullPage:true});
    await page.screenshot({path:path.join(artifacts,'mobile-first-screen.png')});

    // Measure rendered text against its actual ancestor backgrounds, including
    // inherited opacity, rather than checking palette constants in isolation.
    for (const mode of ['dark','light']) {
      await page.emulateMedia({colorScheme:mode});
      await page.waitForFunction((mode)=>document.documentElement.dataset.theme===mode,mode);
      for (const route of ['#day-2','#prepare','#info']) {
        await page.goto(origin+'/'+route);
        await page.waitForFunction((hash)=>location.hash===hash,route);
        const contrast = await page.evaluate(()=>{
          const rgba=(color)=>{
            const values=color.match(/[\d.]+/g)?.map(Number) || [0,0,0];
            return [...values.slice(0,3),values[3] ?? 1];
          };
          const blend=(front,back)=>front.slice(0,3).map((v,i)=>v*front[3]+back[i]*(1-front[3])).concat(1);
          const background=(el)=>{
            if(!el) return [255,255,255,1];
            const own=rgba(getComputedStyle(el).backgroundColor);
            return own[3]===1 ? own : blend(own,background(el.parentElement));
          };
          const luminance=(color)=>color.slice(0,3).map((c)=>{c/=255;return c<=.04045 ? c/12.92 : ((c+.055)/1.055)**2.4;}).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);
          const results=[];
          for(const el of document.querySelectorAll('body *')){
            if(![...el.childNodes].some((n)=>n.nodeType===Node.TEXT_NODE && n.textContent.trim()))continue;
            if(!el.getClientRects().length || el.closest('.hero-art,[aria-hidden="true"],noscript,script,style'))continue;
            const style=getComputedStyle(el);
            if(style.visibility==='hidden' || el.closest('button:disabled'))continue;
            let opacity=1;
            for(let node=el;node;node=node.parentElement)opacity*=Number(getComputedStyle(node).opacity);
            if(opacity===0)continue;
            const bg=background(el);
            const fg=rgba(style.color);fg[3]*=opacity;
            const one=luminance(blend(fg,bg)),two=luminance(bg);
            const ratio=(Math.max(one,two)+.05)/(Math.min(one,two)+.05);
            results.push({text:el.textContent.trim().slice(0,65),ratio:Number(ratio.toFixed(2)),selector:el.className});
          }
          return {count:results.length,failures:results.filter((r)=>r.ratio<4.5)};
        });
        assert(contrast.count>20,'contrast scan must include visible text');
        assert.deepEqual(contrast.failures,[],`${mode} ${route}: text below 4.5:1`);
      }
      await page.goto(origin+'/#day-2');
      await page.waitForFunction(()=>document.querySelectorAll('.event').length===14);
      await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,document.querySelector('#day-tabs').getBoundingClientRect().top+scrollY-10);});
      await page.screenshot({path:path.join(artifacts,`mobile-${mode}.png`),fullPage:false});
      pass(`${mode} mode: rendered schedule/checklist/info text contrast >=4.5:1, mobile screenshot`);
    }
    await page.getByRole('switch',{name:'다크 모드'}).click();
    assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    await page.reload({waitUntil:'networkidle'});
    assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    await page.emulateMedia({colorScheme:'light'});
    assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    await page.getByRole('switch',{name:'다크 모드'}).click();
    assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
    assert.equal(await page.locator('[data-event-id="d2-10"] .event-title').textContent(),'팀랩 플래닛 TOKYO');
    assert.equal(await page.locator('[data-event-id="d2-6"] .event-title').textContent(),'모헤지 시부야 스크램블 스퀘어점');
    await page.goto(origin+'/#day-1');
    await page.waitForFunction(()=>document.querySelectorAll('.event').length===11);
    assert.equal(await page.locator('[data-event-id="d1-7"] .event-title').textContent(),'이치란 아사쿠사점');
    pass('manual theme selection survives reload/system changes; prominent titles name actual places');

    const counts=[11,14,2,3];
    for(let day=1;day<=4;day++){
      await page.getByRole('tab').nth(day-1).click();
      await page.waitForFunction((count)=>document.querySelectorAll('.event').length===count,counts[day-1]);
      assert.equal(await page.getByRole('tab').nth(day-1).getAttribute('aria-selected'),'true');
      assert.equal(await page.locator('.event-time time').first().getAttribute('datetime'),`2027-01-0${day+3}T${day===1 || day===3 ? '06:30' : '09:00'}:00+09:00`);
    }
    pass('all 4 days, 30 events, UTC+9 timestamps unchanged in US browser timezone');

    await page.getByRole('tab').nth(1).click();
    await page.getByRole('button',{name:'이동만',exact:true}).click();
    assert.equal(await page.locator('.event').count(),6);
    assert.equal(await page.locator('.event:not(.is-move)').count(),0);
    await page.getByRole('button',{name:'방문·휴식',exact:true}).click();
    assert.equal(await page.locator('.event').count(),8);
    await page.getByRole('button',{name:'전체 일정',exact:true}).click();
    assert.equal(await page.locator('.event').count(),14);
    assert.match(await page.locator('.day-warning').textContent(),/아키하바라점.*아사쿠사점/);
    assert.equal(await page.locator('[data-event-id="d2-12"] a').count(),0);
    pass('filters show 6 transfers / 8 visits, conflicting restaurant has warning and no invented map');

    await page.locator('[data-complete="d2-2"]').click();
    await page.getByRole('navigation',{name:'모바일 주 메뉴'}).getByRole('link',{name:'준비 체크'}).click();
    await page.locator('[data-check="passport"]').check();
    await page.locator('[data-check="flight"]').check();
    assert.equal(await page.locator('#checklist-count').textContent(),'2 / 16');
    assert.equal(await page.locator('#checklist-progress').getAttribute('value'),'2');
    await page.reload({waitUntil:'networkidle'});
    assert.equal(await page.locator('[data-check="passport"]').isChecked(),true);
    await page.getByRole('navigation',{name:'모바일 주 메뉴'}).getByRole('link',{name:'여행 일정'}).click();
    // Reloaded non-day routes default to day 1; direct links restore chosen day.
    await page.goto(origin+'/#day-2');
    assert.equal(await page.locator('[data-complete="d2-2"]').getAttribute('aria-pressed'),'true');
    pass('16-item checklist and event completion survive reload; day URL restores day 2');

    const map = new URL(await page.locator('[data-event-id="d2-1"] a').getAttribute('href'));
    assert.equal(map.searchParams.get('travelmode'),'transit');
    assert.equal(map.searchParams.get('destination'),'Tokyo Tower');
    assert.equal(map.searchParams.get('origin'),'Tobu Hotel Levant Tokyo');
    pass('directions contain correct origin, destination and transit mode');

    await page.getByRole('button',{name:'함께 보기'}).click();
    assert.match(await page.locator('#toast').textContent(),/공개 배포 후/);
    pass('local preview cannot accidentally share an unusable localhost URL');

    await context.setOffline(true);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.querySelectorAll('.event').length===14);
    assert.equal(await page.locator('[data-complete="d2-2"]').getAttribute('aria-pressed'),'true');
    await page.getByRole('tab').nth(2).click();
    await page.waitForFunction(()=>document.querySelectorAll('.event').length===2);
    assert.equal(await page.locator('.event').count(),2);
    await page.getByRole('navigation',{name:'모바일 주 메뉴'}).getByRole('link',{name:'여행 정보'}).click();
    assert.match(await page.locator('#offline-details').textContent(),/저장했어요/);
    assert.match(await page.locator('#connection-status').textContent(),/오프라인/);
    await page.getByRole('button',{name:'업데이트 확인'}).click();
    assert.match(await page.locator('#toast').textContent(),/온라인으로 연결/);
    pass('offline reload, day switching, saved checklist, information and offline-aware update button');
    await context.setOffline(false);

    await page.emulateMedia({media:'print'});
    assert.equal(await page.locator('.print-day:visible').count(),4);
    assert.equal(await page.locator('.print-day tbody tr').count(),30);
    await page.pdf({path:path.join(artifacts,'itinerary-print.pdf'),format:'A4',printBackground:true});
    await page.emulateMedia({media:'screen'});
    pass('print/PDF view contains every day and all 30 events');

    await page.setViewportSize({width:1440,height:1000});
    await page.goto(origin+'/#day-1');
    await page.waitForFunction(()=>document.querySelectorAll('.event').length===11);
    assert.equal(await page.locator('.sidebar').isVisible(),true);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});
    await page.screenshot({path:path.join(artifacts,'desktop.png'),fullPage:true});
    await page.screenshot({path:path.join(artifacts,'desktop-first-screen.png')});
    for (const width of [320,375,768,1024]) {
      await page.setViewportSize({width,height:900});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`overflow at ${width}px`);
    }
    pass('desktop screenshot and 320/375/768/1024/1440px layouts without overflow');

    const desktop = await browser.newContext({viewport:{width:1280,height:900}});
    const keyboard = await desktop.newPage();
    await keyboard.goto(origin+'/#day-1');
    await keyboard.getByRole('tab').nth(0).focus();
    await keyboard.keyboard.press('ArrowRight');
    await keyboard.waitForFunction(()=>location.hash==='#day-2');
    await keyboard.waitForTimeout(100);
    assert.equal(await keyboard.evaluate(()=>document.activeElement.id),'tab-2');
    await keyboard.keyboard.press('End');
    await keyboard.waitForFunction(()=>location.hash==='#day-4');
    pass('ARIA tab keyboard navigation: arrows, End, focus restoration');

    const noStorage = await browser.newContext();
    await noStorage.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('storage denied');}}));
    const denied = await noStorage.newPage();
    await denied.goto(origin+'/');
    await denied.locator('[data-complete="d1-1"]').click();
    await denied.goto(origin+'/#prepare');
    assert.match(await denied.locator('#storage-note').textContent(),/저장을 사용할 수 없어요/);
    pass('storage-disabled browsers still render and explain temporary check state');

    const nested = await browser.newContext();
    const nestedPage = await nested.newPage();
    await nestedPage.goto(origin+'/nested/tokyo-trip/#day-4');
    await nestedPage.waitForFunction(()=>document.querySelectorAll('.event').length===3);
    await nestedPage.waitForFunction(()=>!!navigator.serviceWorker.controller);
    await nestedPage.waitForFunction(()=>document.querySelector('#connection-status').textContent.includes('저장 완료'));
    await nested.setOffline(true);
    await nestedPage.reload({waitUntil:'domcontentloaded'});
    await nestedPage.waitForFunction(()=>document.querySelectorAll('.event').length===3);
    pass('subdirectory deployment: assets, scoped service worker and offline reload');

    const noScriptContext = await browser.newContext({javaScriptEnabled:false});
    const noScript = await noScriptContext.newPage();
    await noScript.goto(origin+'/');
    const textLink = noScript.getByRole('link',{name:'텍스트 일정표 보기'});
    assert.equal(await textLink.isVisible(),true);
    const response = await noScriptContext.request.get(origin+'/itinerary.txt');
    assert.equal(response.status(),200);
    assert.match(await response.text(),/2027-01-07/);
    pass('JavaScript-disabled text fallback contains full itinerary');

    assert.deepEqual(failures,[]);
    pass('no uncaught JavaScript errors or browser console errors under CSP');
    console.log(`\n${checks} checks passed. Screenshots and print PDF: ${artifacts}`);
  } finally {
    await browser.close();
    server.close();
  }
})().catch((error)=>{console.error(error);server.close();process.exitCode=1;});
