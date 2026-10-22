// Exercise the real previously-published v3 app/worker, then deploy current files.
const {chromium}=require('playwright');
const {execFileSync}=require('node:child_process');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const old='56ffdf49d4e914c59bdf19bbb693036f810f1234';
const files=['index.html','styles.css','theme.css','theme.js','app.js','itinerary.js','sw.js','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png','itinerary.txt'];
const legacy=new Map(files.map(name=>[name,execFileSync('git',['show',`${old}:tokyo-trip/${name}`],{cwd:root})]));
let upgrade=false;
const server=http.createServer((req,res)=>{
  const name=new URL(req.url,'http://localhost').pathname.replace(/^\//,'') || 'index.html';
  if(!/^[a-zA-Z0-9._-]+$/.test(name)){res.writeHead(404);res.end();return;}
  const file=path.join(root,'tokyo-trip',name);
  const data=upgrade ? (fs.existsSync(file) ? fs.readFileSync(file) : null) : legacy.get(name);
  if(!data){res.writeHead(404);res.end();return;}
  const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json','.txt':'text/plain'};
  res.writeHead(200,{'Content-Type':mime[path.extname(name)] || 'application/octet-stream','Cache-Control':'no-cache'});res.end(data);
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
  try{
    const page=await browser.newPage({viewport:{width:390,height:844}});
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.waitForFunction(()=>navigator.serviceWorker.controller && document.querySelector('#connection-status').textContent.includes('저장 완료'));
    assert.equal(await page.getByRole('navigation',{name:'모바일 주 메뉴'}).getByRole('link').count(),3);
    upgrade=true;
    await page.reload({waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.querySelector('#prepare-sync-status')?.textContent.includes('가족 공유 연결 전'),{},{timeout:20000});
    assert.equal(await page.getByRole('navigation',{name:'모바일 주 메뉴'}).getByRole('link').count(),4);
    await page.getByRole('navigation',{name:'모바일 주 메뉴'}).getByRole('link',{name:'기념품'}).click();
    await page.waitForFunction(()=>!document.querySelector('#souvenirs-view').hidden);
    assert.equal(await page.locator('#souvenirs-add input[name=name]').isEnabled(),true);
    console.log('PASS real v3 cached app → current four-tab app upgrade, no stale app.js after worker activation');
  } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
