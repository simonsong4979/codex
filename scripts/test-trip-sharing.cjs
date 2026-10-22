// REST/SSE integration fixture + the OFFICIAL Firebase Auth emulator.
// This is NOT a substitute for compiling/deploying database.rules.json against
// the official Database emulator or a configured live Firebase project.
// Prerequisite: firebase emulators:start --only auth --project demo-tokyo-trip
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const site=path.resolve(__dirname,'../tokyo-trip');
const rooms=new Map();
const streams=new Map();
const identities=new Map();
const authOrigin='http://127.0.0.1:9099';
const valid=(room)=>/^[a-f0-9]{32}$/.test(room);
const read=async(req)=>{let raw='';for await(const chunk of req)raw+=chunk;return raw ? JSON.parse(raw) : null;};
const resolveTime=(value)=>JSON.parse(JSON.stringify(value).replace(/\{"\.sv":"timestamp"\}/g,String(Date.now())));
const send=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(value));};
const emit=(room,type,data)=>{for(const res of streams.get(room) || [])res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);};
let backendOrigin;
let origin;
const backend=http.createServer(async(req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','content-type,if-match');
  res.setHeader('Access-Control-Allow-Methods','GET,PUT,PATCH,DELETE,OPTIONS');
  if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
  try {
    const url=new URL(req.url,'http://localhost');
    const token=url.searchParams.get('auth');
    if(!identities.has(token)) {
      const result=await fetch(authOrigin+'/identitytoolkit.googleapis.com/v1/accounts:lookup?key=demo-web-key',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:token})});
      if(!result.ok){send(res,401,{error:'Permission denied'});return;}
      const user=(await result.json()).users[0];
      identities.set(token,user.localId);
    }
    const keys=url.pathname.replace(/^\//,'').replace(/\.json$/,'').split('/');
    const [root,room,part,id]=keys;
    if(root!=='trips' || !valid(room)){send(res,401,{error:'Permission denied'});return;}
    let value=rooms.get(room);
    if(req.method==='GET' && part==='items' && req.headers.accept==='text/event-stream') {
      res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});
      if(!streams.has(room))streams.set(room,new Set());
      streams.get(room).add(res);
      res.write(`event: put\ndata: ${JSON.stringify({path:'/',data:value?.items || null})}\n\n`);
      req.on('close',()=>streams.get(room).delete(res));
      return;
    }
    if(req.method==='GET'){send(res,200,part ? value?.items?.[id] ?? null : value ?? null);return;}
    if(!part && req.method==='PUT') {
      if(value || req.headers['if-match']!=='null_etag'){send(res,412,{error:'ETag mismatch'});return;}
      value=resolveTime(await read(req));rooms.set(room,value);send(res,200,value);return;
    }
    if(!value || part!=='items' || !/^[A-Za-z0-9_-]{1,64}$/.test(id || '')){send(res,401,{error:'Permission denied'});return;}
    value.items ||= {};
    if(req.method==='DELETE') {
      delete value.items[id];emit(room,'put',{path:'/'+id,data:null});send(res,200,null);return;
    }
    const body=resolveTime(await read(req));
    if(req.method==='PUT' && req.headers['if-match']==='null_etag' && value.items[id]){send(res,412,{error:'ETag mismatch'});return;}
    const next=req.method==='PATCH' ? {...value.items[id],...body} : body;
    if(!next.name?.trim() || !['prepare','souvenirs'].includes(next.kind) || !Number.isInteger(next.quantity) || next.quantity<1 || next.quantity>99){send(res,403,{error:'invalid item'});return;}
    value.items[id]=next;
    // Firebase patch keys can be compound paths relative to the event's path.
    if(req.method==='PATCH' && body.name)emit(room,'patch',{path:'/',data:Object.fromEntries(Object.entries(body).map(([key,value])=>[id+'/'+key,value]))});
    else emit(room,req.method==='PATCH' ? 'patch' : 'put',{path:'/'+id,data:req.method==='PATCH' ? body : next});
    send(res,200,body);
  } catch(error){send(res,500,{error:error.message});}
});
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/firebase-config.js') {
    res.writeHead(200,{'Content-Type':'text/javascript','Cache-Control':'no-store'});
    res.end(`window.TOKYO_FIREBASE=${JSON.stringify({apiKey:'demo-web-key',projectId:'demo-tokyo-trip',databaseURL:'https://demo-tokyo-trip-default-rtdb.firebaseio.com',emulators:{auth:authOrigin,database:backendOrigin}})};`);return;
  }
  const file=path.resolve(site,'.'+(url.pathname==='/' ? '/index.html' : url.pathname));
  if(!file.startsWith(site+path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json','.txt':'text/plain'};
  const policy=fs.readFileSync(path.join(site,'_headers'),'utf8').match(/Content-Security-Policy: (.+)/)[1].replace("connect-src 'self'",`connect-src 'self' ${authOrigin} ${backendOrigin}`);
  res.writeHead(200,{'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Content-Security-Policy':policy});res.end(fs.readFileSync(file));
});
const listen=(server)=>new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));

(async()=>{
  await fetch(authOrigin+'/').catch(()=>{throw new Error('Start the official Firebase Authentication emulator on port 9099 first.');});
  await listen(backend);backendOrigin=`http://127.0.0.1:${backend.address().port}`;
  await listen(server);origin=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
  const errors=[];let checks=0;
  const pass=(label)=>{checks++;console.log('PASS '+label);};
  try {
    const one=await browser.newContext({viewport:{width:390,height:844}});
    const two=await browser.newContext({viewport:{width:390,height:844}});
    const a=await one.newPage(),b=await two.newPage();
    for(const page of [a,b])page.on('pageerror',e=>errors.push(e.message));
    await a.goto(origin+'/#prepare');
    await a.waitForFunction(()=>document.querySelector('#prepare-sync-status').textContent.includes('실시간 공유 중'));
    const room=new URL(a.url()).searchParams.get('trip');
    assert(valid(room));
    await b.goto(origin+'/?trip='+room+'#prepare');
    await b.waitForFunction(()=>document.querySelector('#prepare-sync-status').textContent.includes('실시간 공유 중'));
    assert.equal(await a.getByRole('navigation',{name:'모바일 주 메뉴'}).getByRole('link').count(),4);
    assert.equal(await b.locator('#checklist-count').textContent(),'0 / 16');
    assert.equal(new Set(identities.values()).size,2);
    pass('two isolated devices, distinct official anonymous Auth identities, same 16-item room, four tabs');

    await a.locator('#prepare-add input[name=name]').fill('멀티 충전기');
    await a.locator('#prepare-add summary').click();
    await a.locator('#prepare-add input[name=quantity]').fill('2');
    await a.locator('#prepare-add input[name=owner]').fill('엄마');
    await a.locator('#prepare-add button[type=submit]').click();
    await b.waitForFunction(()=>document.querySelector('#checklist-count').textContent==='0 / 17');
    let row=b.locator('.shared-item').filter({hasText:'멀티 충전기'});
    assert.match(await row.textContent(),/수량 2 · 엄마/);
    pass('add preparation item reaches another device over SSE without refresh');

    await row.getByRole('button',{name:'멀티 충전기 수정'}).click();
    await b.locator('#item-edit-form input[name=name]').fill('멀티 충전기 + 케이블');
    await b.locator('#item-edit-form input[name=owner]').fill('아빠');
    await a.locator('.shared-item').filter({hasText:'멀티 충전기'}).getByRole('checkbox').check();
    await b.waitForFunction(()=>document.querySelector('#checklist-count').textContent==='1 / 17');
    await b.locator('#edit-save').click();
    await a.waitForFunction(()=>[...document.querySelectorAll('.shared-item')].some(el=>el.textContent.includes('멀티 충전기 + 케이블') && el.textContent.includes('아빠')));
    assert.equal(await a.locator('.shared-item').filter({hasText:'멀티 충전기 + 케이블'}).getByRole('checkbox').isChecked(),true);
    pass('concurrent edits preserve another device’s completion change and update name/owner');

    await a.getByRole('button',{name:'멀티 충전기 + 케이블 수정'}).click();
    await b.getByRole('button',{name:'멀티 충전기 + 케이블 수정'}).click();
    await a.locator('#item-edit-form input[name=quantity]').fill('4');
    await b.locator('#item-edit-form input[name=name]').fill('충전기 세트');
    await a.locator('#edit-save').click();
    await b.waitForFunction(()=>[...document.querySelectorAll('.shared-item')].some(el=>el.textContent.includes('수량 4')));
    await b.locator('#edit-save').click();
    await a.waitForFunction(()=>[...document.querySelectorAll('.shared-item')].some(el=>el.textContent.includes('충전기 세트') && el.textContent.includes('수량 4')));
    pass('two edit dialogs submit only changed fields, preserving concurrent quantity/name edits');

    await a.getByRole('button',{name:'충전기 세트 수정'}).click();
    await b.getByRole('button',{name:'충전기 세트 삭제'}).click();
    await a.waitForFunction(()=>document.querySelector('#edit-save').disabled);
    assert.match(await a.locator('#edit-message').textContent(),/다른 사용자가.*삭제/);
    await a.locator('#edit-cancel').click();
    await b.getByRole('button',{name:'되돌리기'}).click();
    await a.waitForFunction(()=>[...document.querySelectorAll('.shared-item')].some(el=>el.textContent.includes('충전기 세트')));
    pass('remote deletion blocks an open editor; undo restores the item on every device');

    for(const page of [a,b])await page.getByRole('navigation',{name:'모바일 주 메뉴'}).getByRole('link',{name:'기념품'}).click();
    assert.match(await b.locator('.list-empty').textContent(),/기념품 항목이 없습니다/);
    await a.locator('#souvenirs-add input[name=name]').fill('도쿄 바나나');
    await a.locator('#souvenirs-add summary').click();
    await a.locator('#souvenirs-add input[name=quantity]').fill('3');
    await a.locator('#souvenirs-add input[name=place]').fill('도쿄역');
    await a.locator('#souvenirs-add button[type=submit]').click();
    await b.waitForFunction(()=>document.querySelector('#souvenir-count').textContent==='0 / 1');
    row=b.locator('.shared-item').filter({hasText:'도쿄 바나나'});
    assert.match(await row.textContent(),/수량 3 · 도쿄역/);
    await row.getByRole('checkbox').check();
    await a.waitForFunction(()=>document.querySelector('#souvenir-count').textContent==='1 / 1');
    pass('souvenir quantity, purchase location and bought state are shared');

    await row.getByRole('button',{name:'도쿄 바나나 삭제'}).click();
    await a.waitForFunction(()=>document.querySelector('#souvenir-count').textContent==='0 / 0');
    await b.getByRole('button',{name:'되돌리기'}).click();
    await a.waitForFunction(()=>document.querySelector('#souvenir-count').textContent==='1 / 1');
    pass('delete and six-second undo propagate, preserving quantity/location/completion');

    await two.setOffline(true);
    await b.waitForFunction(()=>document.querySelector('#souvenirs-sync-status').textContent.includes('오프라인'));
    assert.equal(await b.locator('#souvenirs-add input[name=name]').isDisabled(),true);
    assert.equal(await b.locator('.shared-item').filter({hasText:'도쿄 바나나'}).getByRole('checkbox').isDisabled(),true);
    assert.equal(await b.locator('.shared-item').filter({hasText:'도쿄 바나나'}).isVisible(),true);
    await a.locator('#souvenirs-add input[name=name]').fill('抹茶 쿠키');
    await a.locator('#souvenirs-add button[type=submit]').click();
    await a.waitForFunction(()=>document.querySelector('#souvenir-count').textContent==='1 / 2');
    assert.equal(await b.locator('.shared-item').filter({hasText:'抹茶 쿠키'}).count(),0);
    await two.setOffline(false);
    await b.waitForFunction(()=>document.querySelector('#souvenir-count').textContent==='1 / 2' && document.querySelector('#souvenirs-sync-status').textContent.includes('실시간'));
    pass('offline lists are readable and immutable; reconnect fetches authoritative remote additions');

    const three=await browser.newContext();const c=await three.newPage();
    await c.goto(origin+'/#souvenirs');
    await c.waitForFunction(()=>document.querySelector('#souvenirs-sync-status').textContent.includes('실시간'));
    assert.notEqual(new URL(c.url()).searchParams.get('trip'),room);
    assert.equal(await c.locator('#souvenir-count').textContent(),'0 / 0');
    pass('different trip links remain isolated');

    await a.locator('#souvenirs-add input[name=name]').fill('<img src=x onerror=alert(1)>');
    await a.locator('#souvenirs-add button[type=submit]').click();
    await b.waitForFunction(()=>document.querySelector('#souvenir-count').textContent==='1 / 3');
    assert.equal(await b.locator('#souvenir-list img').count(),0);
    pass('user-entered HTML renders as plain text');

    await one.setOffline(true);
    await a.reload({waitUntil:'domcontentloaded'});
    await a.waitForFunction(()=>document.querySelector('#souvenir-count').textContent==='1 / 3');
    assert.equal(await a.locator('#souvenirs-add input[name=name]').isDisabled(),true);
    await one.setOffline(false);
    await a.waitForFunction(()=>document.querySelector('#souvenirs-sync-status').textContent.includes('실시간'));
    pass('offline reload restores per-room cached lists without enabling queued edits');

    // Delete every item as a real authenticated client and verify no reseeding.
    const token=await a.evaluate(()=>JSON.parse(localStorage.getItem('tokyo-firebase-auth-demo-tokyo-trip')).idToken);
    for(const id of Object.keys(rooms.get(room).items)) {
      const response=await fetch(`${backendOrigin}/trips/${room}/items/${id}.json?auth=${encodeURIComponent(token)}`,{method:'DELETE'});
      assert.equal(response.status,200);
    }
    await a.waitForFunction(()=>document.querySelector('#souvenir-count').textContent==='0 / 0');
    await a.reload({waitUntil:'networkidle'});
    await a.waitForFunction(()=>document.querySelector('#souvenirs-sync-status').textContent.includes('실시간'));
    await a.getByRole('navigation',{name:'모바일 주 메뉴'}).getByRole('link',{name:'준비물'}).click();
    assert.equal(await a.locator('#checklist-count').textContent(),'0 / 0');
    pass('empty initialized rooms remain empty after reload; defaults are not resurrected');

    assert.deepEqual(errors,[]);pass('no uncaught exceptions across isolated devices');
    console.log(`\n${checks} integration checks passed (official Auth emulator + Database REST/SSE fixture; live Database rules NOT verified).`);
  } finally {
    await browser.close();
    for(const list of streams.values())for(const res of list)res.end();
    server.close();backend.close();
  }
})().catch(error=>{console.error(error);server.close();backend.close();process.exitCode=1;});
