const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async()=>{
  const browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
  const failures = [];
  try {
    const context = await browser.newContext({viewport:{width:390,height:844}});
    await context.setOffline(true);
    const page = await context.newPage();
    page.on('pageerror',(e)=>failures.push(e.message));
    const html = fs.readFileSync('/workspace/trip-release/tokyo-trip.html','utf8');
    // This managed browser prohibits file:// navigation by administrator policy.
    // Load the exact single-file bytes without networking rather than bypass it.
    await page.setContent(html);
    await page.waitForFunction(()=>document.querySelectorAll('.event').length===11);
    await page.getByRole('tab').nth(3).click();
    await page.waitForFunction(()=>document.querySelectorAll('.event').length===3);
    await page.getByRole('navigation',{name:'모바일 주 메뉴'}).getByRole('link',{name:'준비 체크'}).click();
    await page.locator('[data-check="passport"]').check();
    assert.equal(await page.locator('#checklist-count').textContent(),'1 / 16');
    await page.getByRole('navigation',{name:'모바일 주 메뉴'}).getByRole('link',{name:'여행 정보'}).click();
    assert.match(await page.locator('#offline-details').textContent(),/이 HTML 파일에 전체 일정/);
    assert.equal(await page.locator('#refresh-button').isVisible(),false);
    assert.match(await page.locator('#connection-status').textContent(),/파일에 전체 일정 포함/);
    await page.getByRole('switch',{name:'다크 모드'}).click();
    assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    console.log('PASS portable HTML: offline dates, checklist, information and theme toggle');

    const embedded = await browser.newContext();
    const host = await embedded.newPage();
    host.on('pageerror',(e)=>failures.push(e.message));
    await host.setContent('<iframe title="미리보기" name="trip" sandbox="allow-scripts" style="width:390px;height:844px;border:0"></iframe>');
    await host.locator('iframe').evaluate((iframe,document)=>{iframe.srcdoc=document;},html);
    const frame = host.frame({name:'trip'});
    await frame.waitForFunction(()=>document.querySelectorAll('.event').length===11);
    await frame.getByRole('tab').nth(1).click();
    await frame.waitForFunction(()=>document.querySelectorAll('.event').length===14);
    await frame.getByRole('navigation',{name:'모바일 주 메뉴'}).getByRole('link',{name:'준비 체크'}).click();
    await frame.locator('[data-check="flight"]').check();
    assert.equal(await frame.locator('#checklist-count').textContent(),'1 / 16');
    assert.match(await frame.locator('#storage-note').textContent(),/저장을 사용할 수 없어요/);
    await frame.getByRole('switch',{name:'다크 모드'}).click();
    assert.equal(await frame.locator('html').getAttribute('data-theme'),'dark');
    await frame.getByRole('button',{name:'함께 보기'}).click();
    console.log('PASS opaque-origin sandbox: dates, theme and controls with localStorage and service workers unavailable');

    const restricted = await browser.newContext();
    await restricted.addInitScript(()=>Object.defineProperty(navigator,'serviceWorker',{get(){throw new DOMException('Not allowed','SecurityError');}}));
    const denied = await restricted.newPage();
    denied.on('pageerror',(e)=>failures.push(e.message));
    await denied.goto('http://127.0.0.1:4173/');
    await denied.waitForFunction(()=>document.querySelectorAll('.event').length===11);
    await denied.getByRole('button',{name:'함께 보기'}).click();
    assert.match(await denied.locator('#toast').textContent(),/공개 배포 후/);
    console.log('PASS regular site: throwing serviceWorker getter cannot break remaining controls');
    assert.deepEqual(failures,[]);
    console.log('PASS no uncaught exceptions in portable, sandboxed, or service-worker-restricted contexts');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
