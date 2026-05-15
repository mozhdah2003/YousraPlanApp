const storeKey = 'yousraPlanAppV1';
let state = JSON.parse(localStorage.getItem(storeKey)) || {
  shifts: [
    {id: crypto.randomUUID(), date:'2026-06-06', type:'Vertretung offen', person:'', time:'14–18', note:'Freizeitassistenz gesucht'},
    {id: crypto.randomUUID(), date:'2026-06-07', type:'Elternassistenz', person:'Mozhdah', time:'9–13', note:'Beispiel-Dienst'}
  ],
  todos: [], vacations: [], team: []
};
let current = new Date(2026, 5, 1);
const save = () => localStorage.setItem(storeKey, JSON.stringify(state));
const $ = id => document.getElementById(id);

function typeClass(type){ return type === 'Vertretung offen' ? 'Vertretung' : type; }
function fmtDate(d){ return d.toISOString().slice(0,10); }
function monthName(d){ return d.toLocaleDateString('de-DE', {month:'long', year:'numeric'}); }

function renderCalendar(){
  $('monthTitle').textContent = monthName(current);
  const grid = $('calendarGrid'); grid.innerHTML = '';
  const y = current.getFullYear(), m = current.getMonth();
  const first = new Date(y,m,1); const start = new Date(first);
  const offset = (first.getDay()+6)%7; start.setDate(first.getDate()-offset);
  const today = fmtDate(new Date());
  for(let i=0;i<42;i++){
    const d = new Date(start); d.setDate(start.getDate()+i);
    const ds = fmtDate(d);
    const cell = document.createElement('div');
    cell.className = 'day' + (d.getMonth()!==m?' muted':'') + (ds===today?' today':'');
    cell.innerHTML = `<div class="date">${d.getDate()}.</div>`;
    state.shifts.filter(s=>s.date===ds).forEach(s=>{
      const b = document.createElement('span');
      b.className = `badge ${typeClass(s.type)}`;
      b.textContent = `${s.time ? s.time+' ' : ''}${s.person || s.type}${s.note ? ' – '+s.note : ''}`;
      cell.appendChild(b);
    });
    cell.onclick = () => openDay(ds);
    grid.appendChild(cell);
  }
}

function openDay(date){
  $('dialogTitle').textContent = new Date(date+'T12:00').toLocaleDateString('de-DE', {weekday:'long', day:'2-digit', month:'2-digit'});
  const items = state.shifts.filter(s=>s.date===date);
  $('dialogContent').innerHTML = items.length ? items.map(s=>`<p><b>${s.type}</b><br>${s.time || ''} ${s.person || ''}<br><small>${s.note || ''}</small></p>`).join('') : '<p>Noch nichts geplant.</p>';
  $('dayDialog').showModal();
}

function renderLists(){
  renderList('shiftList', state.shifts, s => `<b>${s.date} · ${s.type}</b><br>${s.time || ''} ${s.person || ''}<br><small>${s.note || ''}</small>`, 'shifts');
  renderList('todoList', state.todos, t => `<b>${t.text}</b><br>${t.owner || 'Niemand zugeteilt'} · ${t.status}`, 'todos');
  renderList('vacationList', state.vacations, v => `<b>${v.person}</b><br>${v.from} bis ${v.to}<br><small>${v.note || ''}</small>`, 'vacations');
  renderList('teamList', state.team, p => `<b>${p.name} ${p.short ? '('+p.short+')' : ''}</b><br>${p.phone || ''}<br><small>${p.note || ''}</small>`, 'team');
}
function renderList(id, arr, template, key){
  $(id).innerHTML = arr.length ? arr.map(x=>`<div class="item"><div>${template(x)}</div><button class="delete" onclick="removeItem('${key}','${x.id}')">Löschen</button></div>`).join('') : '<p>Noch keine Einträge.</p>';
}
window.removeItem = (key,id) => { state[key] = state[key].filter(x=>x.id!==id); save(); renderAll(); };

function add(formId, key, build){
  $(formId).addEventListener('submit', e=>{ e.preventDefault(); state[key].push({id:crypto.randomUUID(), ...build()}); save(); e.target.reset(); renderAll(); });
}
add('shiftForm','shifts',()=>({date:$('shiftDate').value,type:$('shiftType').value,person:$('shiftPerson').value,time:$('shiftTime').value,note:$('shiftNote').value}));
add('todoForm','todos',()=>({text:$('todoText').value,owner:$('todoOwner').value,status:$('todoStatus').value}));
add('vacationForm','vacations',()=>({person:$('vacPerson').value,from:$('vacFrom').value,to:$('vacTo').value,note:$('vacNote').value}));
add('teamForm','team',()=>({name:$('teamName').value,short:$('teamShort').value,phone:$('teamPhone').value,note:$('teamNote').value}));

document.querySelectorAll('.tab').forEach(btn=>btn.onclick=()=>{ document.querySelectorAll('.tab,.view').forEach(x=>x.classList.remove('active')); btn.classList.add('active'); $(btn.dataset.view).classList.add('active'); });
$('prevMonth').onclick=()=>{ current.setMonth(current.getMonth()-1); renderCalendar(); };
$('nextMonth').onclick=()=>{ current.setMonth(current.getMonth()+1); renderCalendar(); };
$('exportBtn').onclick=()=>{ const blob = new Blob([JSON.stringify(state,null,2)], {type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='dienstplanung-yousra-daten.json'; a.click(); };
function renderAll(){ renderCalendar(); renderLists(); }
renderAll();
