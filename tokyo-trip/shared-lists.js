// Dependency-free Firebase REST/SSE client. List cache is for reading offline;
// writes always require a live connection, and never silently become local edits.
// v3 installations cache older app.js. This new asset upgrades the page after
// the new worker takes control, without discarding an in-progress form.
if (document.documentElement.dataset.mode!=='portable') {
  try {
    const previous=navigator.serviceWorker?.controller;
    if(previous) navigator.serviceWorker.addEventListener('controllerchange',()=>{
      if(navigator.serviceWorker.controller===previous || window.tripUpgradeReloading)return;
      const dirty=document.querySelector('dialog[open]') || [...document.querySelectorAll('input:not([type=checkbox]):not([type=hidden])')].some(input=>input.value!==input.defaultValue) || document.activeElement?.matches('input,textarea,select');
      if(dirty) {const note=document.querySelector('#toast');if(note){note.textContent='새 버전이 준비됐어요. 입력 내용을 저장한 뒤 새로고침해 주세요.';note.classList.add('visible');}return;}
      window.tripUpgradeReloading=true;location.reload();
    });
  } catch { /* Sandboxed previews may prohibit service worker access. */ }
}
window.createTripLists = function ({seed,legacyChecked=[],onChange}) {
  const config = window.TOKYO_FIREBASE || {};
  const portable = document.documentElement.dataset.mode === 'portable';
  const configured = !portable && Boolean(config.apiKey && config.projectId && config.databaseURL);
  const safeRead = (key,fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  let storageOK = true;
  const safeWrite = (key,value) => { try { localStorage.setItem(key,JSON.stringify(value)); } catch { storageOK=false; } };
  const random = () => Array.from(crypto.getRandomValues(new Uint8Array(16)),(n)=>n.toString(16).padStart(2,'0')).join('');
  const url = new URL(location.href);
  const requested = url.searchParams.get('trip');
  const remembered = safeRead('tokyo-family-room',null);
  const room = /^[a-f0-9]{32}$/.test(requested || '') ? requested : /^[a-f0-9]{32}$/.test(remembered || '') ? remembered : random();
  safeWrite('tokyo-family-room',room);
  if (configured) { url.searchParams.set('trip',room); try { history.replaceState(null,'',url); } catch { /* read-only preview */ } }
  const cacheKey = `tokyo-family-items-${configured ? config.projectId : 'local'}-${room}`;
  const cache = safeRead(cacheKey,null);
  const defaults = Object.fromEntries(seed.map(([id,name],index)=>[id,{name,kind:'prepare',quantity:1,owner:'',place:'',done:legacyChecked.includes(id),createdAt:Date.now()+index,updatedAt:Date.now()+index}]));
  let items = cache && typeof cache === 'object' && !Array.isArray(cache) ? cache : configured ? {} : defaults;
  let status = configured ? 'connecting' : 'local';
  let busy = false;
  let source;
  let auth;
  let refreshTimer;
  let connecting;
  let revision = 0;
  const offline = () => !navigator.onLine;
  const writable = () => !offline() && !busy && (status==='connected' || !configured);
  const emit = () => { revision++; onChange?.({items,configured,status,busy,writable:writable(),storageOK,room,revision}); };
  const save = () => { safeWrite(cacheKey,items); emit(); };

  async function fetchTimed(url,options) {
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),15000);
    try {return await fetch(url,{...options,signal:controller.signal});}
    finally {clearTimeout(timer);}
  }

  let database = String(config.databaseURL || '').replace(/\/$/,'');
  let authBase = 'https://identitytoolkit.googleapis.com/v1';
  let refreshBase = 'https://securetoken.googleapis.com/v1';
  if (configured) {
    const endpoint = new URL(database);
    const local = ['127.0.0.1','localhost'].includes(location.hostname);
    if (local && config.emulators) {
      if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(config.emulators.auth) || !/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(config.emulators.database)) throw new Error('Invalid emulator endpoint');
      authBase = `${config.emulators.auth}/identitytoolkit.googleapis.com/v1`;
      refreshBase = `${config.emulators.auth}/securetoken.googleapis.com/v1`;
      database = `${config.emulators.database}?ns=${encodeURIComponent(config.projectId+'-default-rtdb')}`;
    } else if (endpoint.protocol!=='https:' || !/\.(firebaseio\.com|firebasedatabase\.app)$/.test(endpoint.hostname) || endpoint.username || endpoint.password || endpoint.pathname!=='/' || endpoint.search) {
      throw new Error('Invalid Firebase database URL');
    }
  }

  async function authenticate() {
    const key = `tokyo-firebase-auth-${config.projectId}`;
    const stored = auth || safeRead(key,null);
    if (stored?.idToken && stored.expiresAt>Date.now()+60000) { auth=stored; scheduleRefresh(); return; }
    let response;
    if (stored?.refreshToken) {
      response = await fetchTimed(`${refreshBase}/token?key=${encodeURIComponent(config.apiKey)}`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'refresh_token',refresh_token:stored.refreshToken})});
    }
    if (!response?.ok) response = await fetchTimed(`${authBase}/accounts:signUp?key=${encodeURIComponent(config.apiKey)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({returnSecureToken:true})});
    if (!response.ok) throw new Error('anonymous-auth');
    const data = await response.json();
    auth = {idToken:data.idToken || data.id_token,refreshToken:data.refreshToken || data.refresh_token,expiresAt:Date.now()+Number(data.expiresIn || data.expires_in || 3600)*1000};
    safeWrite(key,auth);
    scheduleRefresh();
  }

  function scheduleRefresh() {
    clearTimeout(refreshTimer);
    refreshTimer=setTimeout(()=>connect(),Math.max(1000,auth.expiresAt-Date.now()-90000));
  }

  function endpoint(path='') {
    const base = new URL(database);
    base.pathname = `/trips/${room}${path}.json`;
    base.searchParams.set('auth',auth.idToken);
    return base.href;
  }

  async function request(path,method='GET',value,conditional=false) {
    const headers = {'Content-Type':'application/json'};
    if (conditional) headers['if-match']='null_etag';
    const response = await fetchTimed(endpoint(path),{method,headers,body:value===undefined ? undefined : JSON.stringify(value),cache:'no-store'});
    if (!response.ok) throw new Error(response.status===401 || response.status===403 ? 'permission' : 'network');
    return response.json();
  }

  function applyAt(path,value) {
    const keys=path.split('/').filter(Boolean);
    if(keys.some(key=>['__proto__','prototype','constructor'].includes(key)))throw new Error('invalid path');
    if(!keys.length){items=value || {};return;}
    let node=items;
    for(const key of keys.slice(0,-1)) {
      if(!node[key] || typeof node[key]!=='object')node[key]={};
      node=node[key];
    }
    if(value===null)delete node[keys[keys.length-1]];else node[keys[keys.length-1]]=value;
  }

  function streamUpdate(event,patch) {
    try {
      const update=JSON.parse(event.data);
      if(patch)for(const [key,value] of Object.entries(update.data || {}))applyAt(update.path+'/'+key,value);
      else applyAt(update.path,update.data);
      status='connected';save();
    }catch{status='error';emit();}
  }

  async function connect() {
    if (!configured) { emit(); return; }
    if (offline()) { status='offline'; emit(); return; }
    if (connecting) return connecting;
    connecting = (async()=>{
      source?.close(); status='connecting'; emit();
      try {
        await authenticate();
        let snapshot = await request();
        if (!snapshot) {
          const timestamp = {'.sv':'timestamp'};
          const initial = Object.fromEntries(seed.map(([id,name])=>[id,{name,kind:'prepare',quantity:1,owner:'',place:'',done:legacyChecked.includes(id),createdAt:timestamp,updatedAt:timestamp}]));
          try { await request('','PUT',{version:1,items:initial},true); }
          catch (error) { if (!(await request())?.version) throw error; }
          snapshot = await request();
        }
        if (snapshot.version!==1) throw new Error('schema');
        items=snapshot.items || {}; save();
        source = new EventSource(endpoint('/items'));
        source.addEventListener('put',(event)=>streamUpdate(event,false));
        source.addEventListener('patch',(event)=>streamUpdate(event,true));
        source.addEventListener('auth_revoked',()=>{source.close();auth=null;status='error';emit();});
        source.addEventListener('cancel',()=>{source.close();status='error';emit();});
        source.onerror=()=>{status=offline() ? 'offline' : 'reconnecting';emit();};
      } catch { status='error';emit(); }
      finally { connecting=null; }
    })();
    return connecting;
  }

  async function write(operation) {
    if (!writable()) throw new Error(offline() ? '인터넷 연결 후 수정할 수 있어요.' : '가족 공유 연결을 확인한 후 다시 시도해 주세요.');
    busy=true; emit();
    try { return await operation(); }
    catch { throw new Error('저장하지 못했어요. 연결 상태와 공유 설정을 확인해 주세요.'); }
    finally { busy=false; emit(); }
  }

  function clean(fields) {
    const name=String(fields.name || '').trim();
    const quantity=Number(fields.quantity);
    const owner=String(fields.owner || '').trim();
    const place=String(fields.place || '').trim();
    if(!name || name.length>120 || !Number.isInteger(quantity) || quantity<1 || quantity>99 || owner.length>40 || place.length>100) throw new Error('품목명과 수량(1–99)을 확인해 주세요.');
    return {name,quantity,owner,place};
  }

  window.addEventListener('offline',()=>{source?.close();status=configured ? 'offline' : 'local';emit();});
  window.addEventListener('online',()=>{if(configured) connect(); else emit();});
  window.addEventListener('storage',(event)=>{if(!configured && event.key===cacheKey) {const next=safeRead(cacheKey,{});if(next && typeof next==='object' && !Array.isArray(next)){items=next;emit();}}});

  return {
    room,configured,start:connect,reconnect:connect,
    snapshot:()=>({items,configured,status,busy,writable:writable(),storageOK,room,revision}),
    add(kind,fields) {
      const value={...clean(fields),kind,done:false};
      if(!['prepare','souvenirs'].includes(kind)) throw new Error('Invalid kind');
      if(Object.keys(items).length>=300) throw new Error('목록은 합계 300개까지 추가할 수 있어요.');
      const id='item-'+random();
      return write(async()=>{
        if(configured) {const ts={'.sv':'timestamp'};await request('/items/'+id,'PUT',{...value,createdAt:ts,updatedAt:ts},true);}
        else {items[id]={...value,createdAt:Date.now(),updatedAt:Date.now()};save();}
        return id;
      });
    },
    edit(id,fields,baseline=items[id]) {
      const value=clean(fields);
      if(!items[id]) return Promise.reject(new Error('이미 삭제된 항목이에요.'));
      const changed=Object.fromEntries(Object.entries(value).filter(([key,entry])=>baseline?.[key]!==entry));
      if(!Object.keys(changed).length)return Promise.resolve();
      return write(async()=>{if(configured) await request('/items/'+id,'PATCH',{...changed,updatedAt:{'.sv':'timestamp'}});else {items[id]={...items[id],...changed,updatedAt:Date.now()};save();}});
    },
    toggle(id,done) {
      if(!items[id]) return Promise.reject(new Error('이미 삭제된 항목이에요.'));
      return write(async()=>{if(configured) await request('/items/'+id,'PATCH',{done,updatedAt:{'.sv':'timestamp'}});else {items[id]={...items[id],done,updatedAt:Date.now()};save();}});
    },
    remove(id) {
      if(!items[id]) return Promise.reject(new Error('이미 삭제된 항목이에요.'));
      const value={...items[id]};
      return write(async()=>{if(configured) await request('/items/'+id,'DELETE');else {delete items[id];save();}return {id,value};});
    },
    restore({id,value}) {
      return write(async()=>{if(configured) await request('/items/'+id,'PUT',{...value,updatedAt:{'.sv':'timestamp'}},true);else {if(items[id]) throw new Error('이미 복구된 항목이에요.');items[id]={...value,updatedAt:Date.now()};save();}});
    }
  };
};
