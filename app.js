'use strict';
(()=>{
 const C=window.KPICore,$=id=>document.getElementById(id);
 let rows=C.SAMPLE.map((r,i)=>({...r,id:'sample-'+i})),options={};
 const fmt=v=>BigInt(v).toLocaleString('ko-KR');
 function selectOptions(id,values){const el=$(id),selected=el.value;el.replaceChildren(new Option('전체',''));[...new Set(values)].sort().forEach(v=>el.add(new Option(v,v)));if([...el.options].some(o=>o.value===selected))el.value=selected;}
 function draw(){
  const data=rows.filter(r=>(!$('filter-month').value||r.month===$('filter-month').value)&&(!$('filter-team').value||r.team===$('filter-team').value)&&(!$('filter-user').value||r.user_id===$('filter-user').value));
  const total=C.summarize(data);$('total-target').textContent=fmt(total.target)+'원';$('total-actual').textContent=fmt(total.actual)+'원';$('total-rate').textContent=total.rate;$('total-count').textContent=total.count+'건';
  $('rows').replaceChildren();$('chart').replaceChildren();
  $('empty').hidden=!!data.length;
  $('owner-head').hidden=!options.showOwner;$('action-head').hidden=!options.editable;
  for(const r of data){const tr=document.createElement('tr');
   const cells=[r.month,r.team,fmt(r.target),fmt(r.actual),C.summarize([r]).rate];
   if(options.showOwner)cells.push(r.user_id||'샘플');
   for(const value of cells){const td=document.createElement('td');td.textContent=value;tr.append(td);}
   if(options.editable){const td=document.createElement('td');for(const [label,handler] of [['수정',options.onEdit],['삭제',options.onDelete]]){const b=document.createElement('button');b.textContent=label;b.type='button';b.disabled=!!options.busy;b.onclick=()=>handler?.(r);td.append(b);}tr.append(td);}
   $('rows').append(tr);
  }
  for(const team of [...new Set(data.map(r=>r.team))]){
   const summary=C.summarize(data.filter(r=>r.team===team)),bar=document.createElement('div');bar.className='barrow';
   const label=document.createElement('span');label.textContent=team;
   const track=document.createElement('div');track.className='track';const fill=document.createElement('div');fill.className='fill';
   fill.style.width=(summary.rate==='목표 미설정'?0:Math.min(100,Number(summary.rate.slice(0,-1))))+'%';track.append(fill);
   const rate=document.createElement('span');rate.textContent=summary.rate;bar.append(label,track,rate);$('chart').append(bar);
  }
 }
 function setRows(next,opts={}){rows=next;options=opts;selectOptions('filter-month',rows.map(r=>r.month));selectOptions('filter-team',rows.map(r=>r.team));selectOptions('filter-user',rows.map(r=>r.user_id||'샘플'));$('user-filter-label').hidden=!options.showOwner;draw();}
 for(const id of ['filter-month','filter-team','filter-user'])$(id).onchange=draw;
 $('filter-reset').onclick=()=>{for(const id of ['filter-month','filter-team','filter-user'])$(id).value='';draw();};
 window.KPIDashboard={setRows,draw};setRows(rows);
})();


(()=>{
 const $=id=>document.getElementById(id), form=$('record-form'), store=KPIStores.createSampleStore(KPICore.SAMPLE);
 let editingId=null;
 const showError=message=>{const box=$('app-error');box.textContent=message||'';box.hidden=!message;};
 const reload=async()=>{try{const records=await store.list();KPIDashboard.setRows(records,{editable:true,onEdit:edit,onDelete:remove});showError('');}catch(error){showError('자료를 불러오지 못했습니다: '+error.message);}};
 function clearForm(){editingId=null;form.reset();$('cancel-edit').hidden=true;form.querySelector('button[type=submit]').textContent='자료 추가';}
 function edit(row){editingId=row.id;$('entry-month').value=row.month;$('entry-team').value=row.team;$('entry-target').value=row.target;$('entry-actual').value=row.actual;$('cancel-edit').hidden=false;form.querySelector('button[type=submit]').textContent='수정 저장';$('form-status').textContent='수정할 내용을 입력하세요.';form.scrollIntoView({behavior:'smooth',block:'start'});}
 async function remove(row){if(!window.confirm(`${row.month} ${row.team} 자료를 삭제할까요?`))return;try{await store.remove(row.id);$('form-status').textContent='샘플 자료를 삭제했습니다.';await reload();}catch(error){showError('삭제 실패: '+error.message);}}
 form.addEventListener('submit',async event=>{event.preventDefault();showError('');$('form-status').textContent='';
  try{const record=KPICore.validateRecord({month:$('entry-month').value,team:$('entry-team').value,target:$('entry-target').value,actual:$('entry-actual').value});
   const wasEditing=!!editingId;if(editingId)await store.update(editingId,record);else await store.add(record);
   clearForm();$('form-status').textContent='샘플 자료를 '+(wasEditing?'수정했습니다.':'추가했습니다.');await reload();
  }catch(error){showError(error.message||'입력한 자료를 저장하지 못했습니다.');}
 });
 $('cancel-edit').addEventListener('click',()=>{clearForm();$('form-status').textContent='수정을 취소했습니다.';});
 $('mode-detail').textContent='가상 데이터 전용 · 새로고침하면 입력 변경이 초기화됩니다. 실제 DB에는 저장되지 않습니다.';
 reload();
})();
