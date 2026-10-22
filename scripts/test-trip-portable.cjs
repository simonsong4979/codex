const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const site=path.resolve(__dirname,'../tokyo-trip');
const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  const file=path.resolve(site,'.'+(pathname==='/' ? '/index.html' : pathname));
  if(!file.startsWith(site+path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json','.txt':'text/plain'};
  res.writeHead(200,{'Content-Type':mime[path.extname(file)] || 'application/octet-stream'});res.end(fs.readFileSync(file));
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
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
    await page.getByRole('navigation',{name:'모바일 주 메뉴'}).getByRole('link',{name:'준비물'}).click();
    assert.equal(await page.locator('[data-check="passport"]').isDisabled(),true);
    await context.setOffline(false);
    await page.waitForFunction(()=>!document.querySelector('[data-check="passport"]').disabled);
    await page.locator('[data-check="passport"]').check();
    assert.equal(await page.locator('#checklist-count').textContent(),'1 / 16');
    await page.getByRole('navigation',{name:'모바일 주 메뉴'}).getByRole('link',{name:'여행 정보'}).click();
    assert.match(await page.locator('#offline-details').textContent(),/이 HTML 파일에 전체 일정/);
    assert.equal(await page.locator('#refresh-button').isVisible(),false);
    assert.match(await page.locator('#connection-status').textContent(),/파일에 전체 일정 포함/);
    await page.getByRole('switch',{name:'다크 모드'}).click();
    assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    console.log('PASS portable HTML: offline dates, checklist, information and theme toggle');

    await page.getByRole('navigation',{name:'모바일 주 메뉴'}).getByRole('link',{name:'기념품'}).click();
    await page.locator('#souvenirs-add input[name=name]').fill('도쿄 바나나');
    await page.locator('#souvenirs-add summary').click();
    await page.locator('#souvenirs-add input[name=quantity]').fill('2');
    await page.locator('#souvenirs-add input[name=place]').fill('도쿄역');
    await page.locator('#souvenirs-add button[type=submit]').click();
    assert.equal(await page.locator('#souvenir-count').textContent(),'0 / 1');
    await page.getByRole('button',{name:'도쿄 바나나 수정'}).click();
    await page.locator('#item-edit-form input[name=name]').fill('도쿄 바나나 8개입');
    await page.locator('#edit-save').click();
    await page.getByRole('checkbox',{name:'도쿄 바나나 8개입 구매 완료'}).check();
    await page.getByRole('button',{name:'도쿄 바나나 8개입 삭제'}).click();
    assert.equal(await page.locator('#souvenir-count').textContent(),'0 / 0');
    await page.getByRole('button',{name:'되돌리기'}).click();
    assert.equal(await page.locator('#souvenir-count').textContent(),'1 / 1');
    await page.setViewportSize({width:320,height:844});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.setViewportSize({width:390,height:844});
    await page.evaluate(()=>document.querySelector('#toast').classList.remove('visible'));
    for(const mode of ['dark','light']) {
      if(await page.locator('html').getAttribute('data-theme')!==mode)await page.getByRole('switch',{name:'다크 모드'}).click();
      await page.evaluate(()=>scrollTo(0,document.querySelector('#souvenirs-view').getBoundingClientRect().top+scrollY-20));
      await page.screenshot({path:`/workspace/trip-release/checks/souvenirs-${mode}.png`});
    }
    console.log('PASS local preview: souvenir add/edit/check/delete/undo, quantity/place and two-theme screenshots');

    const embedded = await browser.newContext();
    const host = await embedded.newPage();
    host.on('pageerror',(e)=>failures.push(e.message));
    await host.setContent('<iframe title="미리보기" name="trip" sandbox="allow-scripts" style="width:390px;height:844px;border:0"></iframe>');
    await host.locator('iframe').evaluate((iframe,document)=>{iframe.srcdoc=document;},html);
    const frame = host.frame({name:'trip'});
    await frame.waitForFunction(()=>document.querySelectorAll('.event').length===11);
    await frame.getByRole('tab').nth(1).click();
    await frame.waitForFunction(()=>document.querySelectorAll('.event').length===14);
    await frame.getByRole('navigation',{name:'모바일 주 메뉴'}).getByRole('link',{name:'준비물'}).click();
    await frame.locator('[data-check="flight"]').check();
    assert.equal(await frame.locator('#checklist-count').textContent(),'1 / 16');
    assert.match(await frame.locator('#storage-note').textContent(),/저장.*제한/);
    await frame.getByRole('switch',{name:'다크 모드'}).click();
    assert.equal(await frame.locator('html').getAttribute('data-theme'),'dark');
    await frame.getByRole('button',{name:'함께 보기'}).click();
    console.log('PASS opaque-origin sandbox: dates, theme and controls with localStorage and service workers unavailable');

    const restricted = await browser.newContext();
    await restricted.addInitScript(()=>Object.defineProperty(navigator,'serviceWorker',{get(){throw new DOMException('Not allowed','SecurityError');}}));
    const denied = await restricted.newPage();
    denied.on('pageerror',(e)=>failures.push(e.message));
    await denied.goto(origin+'/');
    await denied.waitForFunction(()=>document.querySelectorAll('.event').length===11);
    await denied.getByRole('button',{name:'함께 보기'}).click();
    assert.match(await denied.locator('#toast').textContent(),/공개 배포 후/);
    console.log('PASS regular site: throwing serviceWorker getter cannot break remaining controls');
    assert.deepEqual(failures,[]);
    console.log('PASS no uncaught exceptions in portable, sandboxed, or service-worker-restricted contexts');
  } finally { await browser.close(); server.close(); }
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
