window.mountTripLists = function ({seed,legacyChecked,toast,icon}) {
  const $=(selector)=>document.querySelector(selector);
  const escape=(value)=>String(value ?? '').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let store;
  let snapshot={items:{},configured:false,status:'local',writable:false,storageOK:true};
  let editId;
  let editBaseline;
  let lastDeleted;
  let undoTimer;
  const labels={prepare:'준비물',souvenirs:'기념품'};

  function statusText() {
    if(!navigator.onLine) return '오프라인 · 저장된 목록 보기';
    if(!snapshot.configured) return snapshot.storageOK ? '이 기기에만 저장 · 가족 공유 연결 전' : '현재 화면에서만 유지 · 브라우저 저장 제한';
    return {connecting:'가족 목록 연결 중',connected:'가족과 실시간 공유 중',reconnecting:'연결 복구 중 · 수정은 잠시 대기',offline:'오프라인 · 저장된 목록 보기',error:'공유 연결 실패 · 다시 연결해 주세요'}[snapshot.status] || '공유 연결 확인 필요';
  }

  function render() {
    for(const kind of ['prepare','souvenirs']) {
      const rows=Object.entries(snapshot.items).filter(([,item])=>item && item.kind===kind).sort((a,b)=>(a[1].createdAt-b[1].createdAt) || a[0].localeCompare(b[0]));
      const count=rows.filter(([,item])=>item.done).length;
      const status=$(`#${kind}-sync-status`);
      if(status.textContent!==statusText()) status.textContent=statusText();
      status.dataset.state=snapshot.configured ? snapshot.status : 'local';
      const countEl=$(kind==='prepare' ? '#checklist-count' : '#souvenir-count');
      countEl.textContent=`${count} / ${rows.length}`;
      const progress=$(kind==='prepare' ? '#checklist-progress' : '#souvenir-progress');
      progress.max=Math.max(1,rows.length);progress.value=count;
      progress.setAttribute('aria-label',`${rows.length}개 중 ${count}개 ${kind==='prepare' ? '준비' : '구매'} 완료`);
      if(kind==='prepare') $('#side-check-count').textContent=`${rows.length}개 중 ${count}개 준비 완료`;
      const list=$(kind==='prepare' ? '#checklist' : '#souvenir-list');
      const focused=document.activeElement;
      const focusedId=focused?.closest('[data-list-id]')?.dataset.listId;
      const focusedAction=focused?.dataset.listAction;
      list.innerHTML=rows.length ? rows.map(([id,item])=>{
        const detail=[item.quantity>1 ? `수량 ${item.quantity}` : '',kind==='prepare' ? item.owner : item.place].filter(Boolean).map(escape).join(' · ');
        return `<article class="shared-item ${item.done ? 'done' : ''}" data-list-id="${escape(id)}"><label class="shared-item-check"><input type="checkbox" data-list-action="toggle" ${kind==='prepare' ? `data-check="${escape(id)}"` : ''} aria-label="${escape(item.name)} ${kind==='prepare' ? '준비' : '구매'} 완료" ${item.done ? 'checked' : ''} ${snapshot.writable ? '' : 'disabled'}><span><strong>${escape(item.name)}</strong>${detail ? `<small>${detail}</small>` : ''}</span></label><div class="shared-item-actions"><button type="button" data-list-action="edit" aria-label="${escape(item.name)} 수정" ${snapshot.writable ? '' : 'disabled'}>${icon('edit')}</button><button type="button" data-list-action="delete" aria-label="${escape(item.name)} 삭제" ${snapshot.writable ? '' : 'disabled'}>${icon('trash')}</button></div></article>`;
      }).join('') : `<p class="list-empty">${labels[kind]} 항목이 없습니다.<br>위에서 품목을 추가해 주세요.</p>`;
      if(focusedId && focusedAction && !$('#item-edit-dialog').open) {
        const row=[...list.querySelectorAll('[data-list-id]')].find((el)=>el.dataset.listId===focusedId);
        row?.querySelector(`[data-list-action="${focusedAction}"]`)?.focus({preventScroll:true});
      }
      $(`#${kind}-add`).querySelectorAll('input,button').forEach((el)=>{el.disabled=!snapshot.writable;});
      $(`#${kind}-retry`).hidden=!snapshot.configured || !['error','reconnecting'].includes(snapshot.status) || !navigator.onLine;
    }
    $('#storage-note').textContent=snapshot.configured
      ? '같은 공유 링크로 접속한 가족에게 목록 변경이 반영됩니다. 인터넷이 끊기면 저장된 목록만 볼 수 있어요.'
      : snapshot.storageOK ? '가족 공유 연결 전에는 이 브라우저에만 저장됩니다. 여행 일정의 완료 표시는 기기별로 유지됩니다.' : '브라우저 저장이 제한되어 현재 화면에서만 유지됩니다. 가족 공유는 아직 연결되지 않았어요.';
    const editing=snapshot.items[editId];
    $('#edit-save').disabled=!snapshot.writable || !editing;
    $('#edit-message').textContent=editId && !editing ? '다른 사용자가 이 항목을 삭제했어요. 닫고 목록을 확인해 주세요.' : !snapshot.writable ? '인터넷·공유 연결 후 저장할 수 있어요.' : '';
    $('#list-undo-button').disabled=!snapshot.writable;
  }

  for(const kind of ['prepare','souvenirs']) {
    const form=$(`#${kind}-add`);
    form.addEventListener('submit',async(event)=>{
      event.preventDefault();
      const fields=Object.fromEntries(new FormData(form));
      try {await store.add(kind,fields);form.reset();form.elements.name.focus();}
      catch(error){toast(error.message);}
    });
    $(`#${kind}-retry`).addEventListener('click',()=>store?.reconnect());
    const list=$(kind==='prepare' ? '#checklist' : '#souvenir-list');
    list.addEventListener('change',async(event)=>{
      if(event.target.dataset.listAction!=='toggle')return;
      const id=event.target.closest('[data-list-id]').dataset.listId;
      try {await store.toggle(id,event.target.checked);}catch(error){toast(error.message);render();}
    });
    list.addEventListener('click',async(event)=>{
      const button=event.target.closest('button[data-list-action]');
      if(!button)return;
      const id=button.closest('[data-list-id]').dataset.listId;
      const item=snapshot.items[id];
      if(!item)return;
      if(button.dataset.listAction==='edit') {
        editId=id;
        editBaseline={...item};
        const form=$('#item-edit-form');
        for(const field of ['name','quantity','owner','place'])form.elements[field].value=item[field];
        $('#edit-owner-label').hidden=item.kind!=='prepare';
        $('#edit-place-label').hidden=item.kind!=='souvenirs';
        $('#item-edit-title').textContent=`${labels[item.kind]} 수정`;
        $('#edit-message').textContent='';
        $('#edit-save').disabled=!snapshot.writable;
        $('#item-edit-dialog').showModal();
      } else if(button.dataset.listAction==='delete') {
        try {
          const deleted=await store.remove(id);
          lastDeleted=deleted;
          clearTimeout(undoTimer);
          $('#list-undo-text').textContent=`${deleted.value.name} 삭제됨`;
          $('#list-undo').hidden=false;
          undoTimer=setTimeout(()=>{lastDeleted=null;$('#list-undo').hidden=true;},6000);
        }catch(error){toast(error.message);}
      }
    });
  }
  $('#edit-cancel').addEventListener('click',()=>$('#item-edit-dialog').close());
  $('#item-edit-dialog').addEventListener('close',()=>{
    const row=[...document.querySelectorAll('[data-list-id]')].find((el)=>el.dataset.listId===editId);
    row?.querySelector('[data-list-action="edit"]')?.focus({preventScroll:true});
  });
  $('#item-edit-form').addEventListener('submit',async(event)=>{
    event.preventDefault();
    const fields=Object.fromEntries(new FormData(event.currentTarget));
    try {await store.edit(editId,fields,editBaseline);$('#item-edit-dialog').close();}
    catch(error){$('#edit-message').textContent=error.message;}
  });
  $('#list-undo-button').addEventListener('click',async()=>{
    if(!lastDeleted)return;
    const deleted=lastDeleted;
    try {await store.restore(deleted);clearTimeout(undoTimer);lastDeleted=null;$('#list-undo').hidden=true;toast('삭제한 항목을 복구했어요.');}
    catch(error){toast(error.message);}
  });
  try {
    store=window.createTripLists({seed,legacyChecked,onChange:(value)=>{snapshot=value;render();}});
    snapshot=store.snapshot();render();store.start();
  }catch{
    snapshot={...snapshot,configured:true,status:'error'};render();
  }
  return {refresh:render,getSnapshot:()=>snapshot};
};
