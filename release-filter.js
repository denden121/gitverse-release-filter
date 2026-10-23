(() => {
  'use strict';
  const repo = '/dgurachevskii/manager';
  const key = 'gv-pr-controls:v2';
  const defaults = { release: 'all', relation: 'all', review: 'all', comments: 'all', ci: 'all', theme: true, draft: 'all', sort: 'native', me: 'dgurachevskii' };
  let state = { ...defaults };
  try { state = { ...defaults, ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch {}
  const host = document.createElement('div');
  host.id = 'gv-release-filter';
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>
    :host{display:block;margin:16px 0;color-scheme:light dark;order:-1}
    section{padding:18px;border:1px solid #78829455;border-radius:12px;font:13px/1.5 system-ui,sans-serif}
    .header,.actions{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
    h2{font-size:15px;margin:0} .muted{opacity:.7;font-size:12px}
    .summary-wrap{overflow-x:auto;margin:12px 0 16px;border:1px solid #78829444;border-radius:8px}
    table{width:100%;border-collapse:collapse;text-align:left;white-space:nowrap;font-variant-numeric:tabular-nums}
    caption{text-align:left;padding:8px 10px;font-size:12px;opacity:.75}
    th,td{padding:7px 10px;border-top:1px solid #78829433}thead th{font-size:11px;font-weight:500;opacity:.75}
    tbody th{font-weight:600}td button{min-width:36px;padding:3px 8px;border-color:transparent;background:transparent}
    tr[data-selected=true]{background:#397bdf12}td button:hover{background:#397bdf22;border-color:#397bdf66}
    [data-tone=bad]{color:light-dark(#ae2020,#ff9a9a)}[data-tone=good]{color:light-dark(#146d38,#75d8a0)}[data-tone=warn]{color:light-dark(#865900,#efca7c)}
    #releases{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
    .filters{display:grid;grid-template-columns:repeat(3,minmax(150px,1fr));gap:12px}
    label{display:flex;flex-direction:column;gap:5px;min-width:0;font-size:12px}
    button,select,input{box-sizing:border-box;font:13px system-ui;color:inherit;background:light-dark(#fff,#242936);border:1px solid #78829466;border-radius:7px}
    select,input{width:100%;height:36px;padding:0 10px;min-width:0}button{min-height:32px;padding:6px 10px;cursor:pointer}
    button[aria-pressed=true]{background:#245fbd;border-color:#4787e8;color:white}button:disabled{opacity:.5;cursor:wait}
    :focus-visible{outline:2px solid #6495ff;outline-offset:2px}
    .actions{border-top:1px solid #78829433;margin-top:14px;padding-top:12px}.actions>div{display:flex;gap:8px}
    details summary{cursor:pointer;font-size:12px;opacity:.8}details label{margin-top:8px;width:200px}
    p{margin:10px 0 0;font-size:12px;opacity:.75}
    @media(min-width:1250px){.filters{grid-template-columns:repeat(6,minmax(130px,1fr))}}
    @media(max-width:620px){.filters{grid-template-columns:repeat(2,minmax(0,1fr))}section{padding:12px}}

    :host{color:#e6edf3;color-scheme:dark}
    section{background:#0d1117;border-color:#30363d;border-radius:6px;padding:16px;box-shadow:0 1px 0 #ffffff04}
    h2{font-size:14px;font-weight:600;letter-spacing:0}
    .muted,p,details summary{color:#8b949e;opacity:1}
    .summary-wrap{border-color:#30363d;border-radius:6px;margin:12px 0 16px;background:#0d1117}
    caption{color:#8b949e;opacity:1;padding:8px 12px;font-size:11px}
    thead{background:#161b22}thead th{opacity:1;color:#8b949e;font-size:12px}
    th,td{border-color:#21262d;padding:5px 12px}tbody th{font-size:13px}
    tr[data-selected=true]{background:#161b22}tbody tr:hover{background:#161b22}
    td button{border-radius:6px;min-height:28px;font-weight:600}td button:hover{background:#21262d;border-color:#484f58}
    [data-tone=good]{color:#3fb950}[data-tone=bad]{color:#f85149}[data-tone=warn]{color:#d29922}
    #releases{gap:0;background:#161b22;border:1px solid #30363d;border-radius:6px;width:fit-content;max-width:100%;overflow:hidden}
    #releases button{border:0;border-radius:0;background:transparent;padding:6px 14px;border-right:1px solid #30363d}
    #releases button:last-child{border-right:0}#releases button:hover{background:#21262d}
    #releases button[aria-pressed=true]{background:#1f6feb;color:#fff}
    label{font-size:12px;font-weight:500;color:#c9d1d9}
    button,select,input{background:#21262d;border-color:#30363d;border-radius:6px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    button:hover,select:hover{background:#30363d;border-color:#8b949e}
    select,input{height:32px}input{background:#0d1117}button{font-weight:500;min-height:30px}
    #refresh{background:#238636;border-color:#2ea043;color:#fff}#refresh:hover{background:#2ea043}
    #reset{color:#c9d1d9;background:transparent;border-color:transparent}#reset:hover{background:#21262d;border-color:#30363d}
    :focus-visible{outline:2px solid #58a6ff;outline-offset:2px}
    .actions{border-color:#21262d}.theme-toggle{display:flex;flex-direction:row;align-items:center;width:auto;gap:8px}
    .theme-toggle input{width:14px;height:14px;accent-color:#1f6feb}
  </style><section aria-label="Сводка и фильтры PR">
  <div class="header"><h2>Сводка по релизам</h2><span class="muted">PR текущей страницы · до применения фильтров</span></div>
  <div class="summary-wrap"><table><caption>Счётчики — количество PR. Нажми число, чтобы отфильтровать список.</caption><thead><tr><th scope="col">Релиз</th><th scope="col">Всего</th><th scope="col">Есть approve</th><th scope="col">Ждут меня</th><th scope="col">Доработки</th><th scope="col">С замечаниями</th><th scope="col">CI с ошибкой</th><th scope="col">Draft</th></tr></thead><tbody id="summary"></tbody></table></div>
  <div id="releases" role="group" aria-label="Релиз"></div>
  <div class="filters">
    <label>Участие <select id="relation"><option value="all">Все PR</option><option value="waiting">Ждут моего ревью</option><option value="mine">Мои PR</option><option value="approved">Я одобрил</option></select></label>
    <label>Ревью <select id="review"><option value="all">Любое</option><option value="yes">Есть approve</option><option value="no">Нет approve</option><option value="pending">Ожидают ревью</option><option value="changes">Нужны доработки</option></select></label>
    <label>Замечания <select id="comments"><option value="all">Все</option><option value="open">Есть открытые</option><option value="resolved">Есть решённые</option><option value="discussion">Есть комментарии</option></select></label>
    <label>CI <select id="ci"><option value="all">Любой статус</option><option value="failed">Есть ошибки</option></select></label>
    <label>Draft <select id="draft"><option value="all">Все</option><option value="yes">Только Draft</option><option value="no">Без Draft</option></select></label>
    <label>Сортировка <select id="sort"><option value="native">Как в GitVerse</option><option value="releaseAsc">Релиз ↑</option><option value="releaseDesc">Релиз ↓</option><option value="new">Сначала новые</option><option value="old">Сначала старые</option><option value="waiting">Сначала ждут меня</option><option value="approvals">Больше approve</option><option value="comments">Больше замечаний</option></select></label>
  </div><div class="actions"><details><summary>Настройки</summary><label class="theme-toggle"><input id="theme" type="checkbox"> Оформление GitHub Dark</label><label>Мой логин <input id="me" aria-label="Мой логин" spellcheck="false"></label></details><div><button id="reset">Сбросить фильтры</button><button id="refresh">Обновить данные</button></div></div>
  <p id="status" role="status" aria-live="polite"></p></section>`;
  const css = document.createElement('style');
  css.textContent = '[data-gv-hidden]{display:none!important}.gv-pr-review-info{font:12px/1.5 system-ui;margin:6px 0;color:inherit;display:flex;flex-wrap:wrap;gap:6px}.gv-pr-review-info a,.gv-pr-review-info span{padding:3px 9px;border-radius:6px;border:1px solid #78829466;text-decoration:none}.gv-pr-review-info a:hover{text-decoration:underline}.gv-pr-review-info [data-tone=good]{color:#53cc89;background:#23845018}.gv-pr-review-info [data-tone=bad]{color:#ff8e8e;background:#d9404018}.gv-pr-review-info [data-tone=warn]{color:#eebf63;background:#c58b2018}';
  document.head.append(css);
  const themeCss = document.createElement('style');
  themeCss.textContent = `
    html.dark[data-gv-github] {
      color-scheme:dark;
      --bg-base:#0d1117!important;--bg-primary:#21262d!important;--bg-secondary:#161b22!important;--bg-tertiary:#161b22!important;
      --bg-popup:#161b22!important;--bg-neutral:#21262d!important;--bg-hover-mute:#21262d!important;--bg-hover:#30363d!important;
      --bg-pressed:#21262d!important;--bg-disabled:#161b22!important;
      --bg-accent:#238636!important;--bg-accent-hover:#2ea043!important;--bg-accent-pressed:#238636!important;--bg-accent-secondary:#238636!important;
      --bg-selected-primary:#1f6feb!important;--bg-selected-tertiary:#21262d!important;
      --color-primary:#e6edf3!important;--color-secondary:#8b949e!important;--color-tertiary:#c9d1d9!important;
      --color-link:#58a6ff!important;--color-accent:#58a6ff!important;--color-accent-hover:#79c0ff!important;--color-accent-pressed:#1f6feb!important;
      --color-selected-invert:#fff!important;--color-success:#3fb950!important;--color-error:#f85149!important;--color-warning:#d29922!important;
      --color-info:#58a6ff!important;--color-merged:#a371f7!important;
      --bd-primary:#30363d!important;--bd-secondary:#21262d!important;--bd-hover:#8b949e!important;
      --bd-accent:#2ea043!important;--bd-focus-primary:#58a6ff!important;--bd-focus-secondary:#58a6ff!important;
    }
    html.dark[data-gv-github] body{background:#0d1117;color:#e6edf3;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    html.dark[data-gv-github] button.bg-bg-accent{border-width:1px!important;border-radius:6px!important;box-shadow:0 1px 0 #ffffff10 inset}
    html.dark[data-gv-github] [data-gv-card]{background:#0d1117;border-color:#30363d;padding:14px 12px!important}
    html.dark[data-gv-github] [data-gv-card]:hover{background:#161b22}
    html.dark[data-gv-github] [data-gv-card] [class*=text-h5]{font-size:16px!important;line-height:24px!important;font-weight:600}
    html.dark[data-gv-github] [data-gv-card] a[href*="/content/"]{color:#8b949e;font-size:12px}
    html.dark[data-gv-github] [data-gv-card] a:hover{color:#58a6ff}
    html.dark[data-gv-github] .gv-pr-review-info{gap:6px;margin-top:10px;font-size:11px;color:#8b949e}
    html.dark[data-gv-github] .gv-pr-review-info a,html.dark[data-gv-github] .gv-pr-review-info span{border:1px solid #30363d;border-radius:20px;padding:1px 8px;background:transparent;line-height:20px}
    html.dark[data-gv-github] .gv-pr-review-info [data-tone=good]{color:#3fb950;border-color:#23863680;background:#23863614}
    html.dark[data-gv-github] .gv-pr-review-info [data-tone=bad]{color:#f85149;border-color:#f8514966;background:#f8514914}
    html.dark[data-gv-github] .gv-pr-review-info [data-tone=warn]{color:#d29922;border-color:#d2992266;background:#d2992214}
  `;
  document.head.append(themeCss);
  const metadata = new Map();
  const modified = new Map();
  const discussions = new Map();
  let commentsLoading = false;
  let loading = false, error = '', lastLoad = 0, frame = 0, releaseSignature = '';
  const observer = new MutationObserver(schedule);
  const onList = () => location.pathname.replace(/\/$/, '') === `${repo}/pulls`;
  const releaseOf = title => title.match(/(?:^|\s)(?:v|релиз\s+)?(\d+\.\d+(?:\.\d+)?)\s*$/i)?.[1] || 'none';
  function rows() {
    const found = new Map();
    for (const link of document.querySelectorAll(`a[href^="${repo}/pulls/"]`)) {
      const id = new URL(link.href).pathname.match(/\/pulls\/(\d+)\/?$/)?.[1];
      if (!id || !link.textContent.trim() || link.closest('.gv-pr-review-info, .gv-pr-preview')) continue;
      const section = link.closest('section.w-full');
      const row = section?.parentElement;
      if (!row?.classList.contains('border-b') || !row.querySelector(`a[href^="${repo}/content/"]`)) continue;
      found.set(id, { id, row, section, release: releaseOf(link.textContent), data: metadata.get(id) });
    }
    return [...found.values()];
  }
  function reviewInfo(data) {
    const reviewers = data?.reviewers;
    if (!Array.isArray(reviewers)) return null;
    const me = reviewers.find(r => r.reviewer?.username?.toLowerCase() === state.me.trim().toLowerCase());
    return { approvals: reviewers.filter(r => r.reviewState === 'APPROVED').length,
      changes: reviewers.filter(r => ['REQUEST_CHANGES', 'CHANGES_REQUESTED'].includes(r.reviewState)).length,
      pending: reviewers.filter(r => r.reviewState === 'REQUEST_REVIEW').length,
      waiting: me?.reviewState === 'REQUEST_REVIEW', approved: me?.reviewState === 'APPROVED' };
  }
  function ciFailed(data) {
    if (!Array.isArray(data?.jobStatuses)) return null;
    return data.jobStatuses.some(job => ['failure','failed','error','timed_out','startup_failure'].includes(String(job.status).toLowerCase()));
  }
  function matches(item) {
    const { data, release } = item, info = reviewInfo(data), discussion = discussions.get(item.id)?.value;
    return (state.release === 'all' || state.release === release)
      && (state.relation === 'all' || (state.relation === 'mine' ? data?.poster?.username?.toLowerCase() === state.me.trim().toLowerCase() : !!info?.[state.relation]))
      && (state.review === 'all' || !!info && (state.review === 'yes' ? info.approvals > 0 : state.review === 'no' ? info.approvals === 0 : state.review === 'changes' ? info.changes > 0 : info.pending > 0))
      && (state.comments === 'all' || !!discussion && (state.comments === 'open' ? discussion.open > 0 : state.comments === 'resolved' ? discussion.resolved > 0 : discussion.comments > 0))
      && (state.ci === 'all' || ciFailed(data) === true)
      && (state.draft === 'all' || typeof data?.isDraft === 'boolean' && data.isDraft === (state.draft === 'yes'));
  }
  function compare(a, b) {
    if (state.sort.startsWith('release')) {
      if (a.release === 'none' || b.release === 'none') return (a.release === 'none') - (b.release === 'none');
      const d = a.release.localeCompare(b.release, undefined, { numeric: true });
      if (d) return state.sort === 'releaseAsc' ? d : -d;
    }
    if (state.sort === 'comments') { const d = (discussions.get(b.id)?.value?.open ?? -1) - (discussions.get(a.id)?.value?.open ?? -1); if (d) return d; }
    if (state.sort === 'waiting') { const d = Number(!!reviewInfo(b.data)?.waiting) - Number(!!reviewInfo(a.data)?.waiting); if (d) return d; }
    if (state.sort === 'approvals') { const d = (reviewInfo(b.data)?.approvals ?? -1) - (reviewInfo(a.data)?.approvals ?? -1); if (d) return d; }
    return state.sort === 'old' ? Number(a.id) - Number(b.id) : Number(b.id) - Number(a.id);
  }
  let summarySignature = '';
  function renderSummary(list) {
    const releases = [...new Set(list.map(item=>item.release))].sort((a,b)=>a==='none'?1:b==='none'?-1:a.localeCompare(b,undefined,{numeric:true}));
    const metrics = [
      ['total','Всего',()=>true,''],
      ['approved','Есть approve',item=>{const r=reviewInfo(item.data);return r ? r.approvals>0 : null;},'good'],
      ['waiting','Ждут меня',item=>reviewInfo(item.data)?.waiting ?? null,'warn'],
      ['changes','Нужны доработки',item=>{const r=reviewInfo(item.data);return r ? r.changes>0 : null;},'bad'],
      ['open','С открытыми замечаниями',item=>{const d=discussions.get(item.id)?.value;return !d ? null : d.open>0 ? true : d.unknown>0 ? null : false;},'bad'],
      ['ci','CI с ошибкой',item=>ciFailed(item.data),'bad'],
      ['draft','Draft',item=>typeof item.data?.isDraft==='boolean'?item.data.isDraft:null,'']
    ];
    const values = releases.map(version=>{
      const group=list.filter(item=>item.release===version);
      return {version, cells:metrics.map(([id,label,test,tone])=>{
        const results=group.map(test),count=results.filter(v=>v===true).length,unknown=results.filter(v=>v===null).length;
        return {id,label,tone,count,unknown};
      })};
    });
    const signature=JSON.stringify([values,state.release]);
    if(signature===summarySignature)return;summarySignature=signature;
    root.getElementById('summary').replaceChildren(...values.map(({version,cells})=>{
      const tr=document.createElement('tr');tr.dataset.selected=String(state.release===version);
      const name=version==='none'?'Без релиза':`v${version}`;
      const th=document.createElement('th');th.scope='row';th.textContent=name;tr.append(th);
      for(const {id,label,tone,count,unknown} of cells){
        const td=document.createElement('td'),button=document.createElement('button');
        button.dataset.metric=id;button.dataset.version=version;button.dataset.tone=count?tone:'';
        button.textContent=unknown ? (count?`${count}+`:'—') : String(count);
        button.title=`${name}: ${label} — ${count} PR${unknown?`; нет данных по ${unknown} PR`:''}. Показать только эти PR; остальные фильтры будут сброшены.`;
        button.setAttribute('aria-label',button.title);td.append(button);tr.append(td);
      }
      return tr;
    }));
  }
  function render() {
    frame = 0; observer.disconnect();
    try {
      for (const [row, original] of modified) { row.removeAttribute('data-gv-hidden'); row.removeAttribute('data-gv-card'); row.style.order = original; }
      document.documentElement.toggleAttribute('data-gv-github', state.theme && location.pathname.startsWith(`${repo}/`));
      root.getElementById('theme').checked=state.theme;
      const detail = location.pathname.match(/^\/dgurachevskii\/manager\/pulls\/\d+(?:\/(files|commits|checks))?\/?$/);
      if (detail) {
        document.documentElement.setAttribute('data-gv-pr-detail', detail[1] || 'discussion');
        const title=document.querySelector('[data-testid="change-pull-title/button-rename"]');
        if(title?.parentElement?.parentElement?.classList.contains('mb-2')) {
          title.parentElement.setAttribute('data-gv-pr-title','');
          title.parentElement.parentElement.setAttribute('data-gv-pr-heading','');
        }
        const summary=document.querySelector('[data-testid="pull-approval-summary"]');
        for(let el=summary?.parentElement;el&&el.tagName!=='MAIN';el=el.parentElement) {
          if(el.classList.contains('border-2')){el.setAttribute('data-gv-approval-box','');break;}
        }
      } else document.documentElement.removeAttribute('data-gv-pr-detail');

      if (!onList()) { host.remove(); document.querySelectorAll('.gv-pr-review-info, .gv-pr-preview').forEach(e => e.remove()); modified.clear(); return; }
      const list = rows();
      if (!list.length) { host.remove(); return; }
      const first = list[0].row;
      if (host.parentElement !== first.parentElement || host.nextElementSibling !== first) first.before(host);
      const counts = new Map();
      list.forEach(r => counts.set(r.release, (counts.get(r.release) || 0) + 1));
      const versions = [...counts.keys()].filter(v => v !== 'none');
      if (!['all','none'].includes(state.release) && !versions.includes(state.release)) versions.push(state.release);
      versions.sort((a,b) => a.localeCompare(b, undefined, { numeric: true }));
      const choices = [['all',`Все (${list.length})`], ...versions.map(v=>[v,`v${v} (${counts.get(v)||0})`]), ['none',`Без релиза (${counts.get('none')||0})`]];
      const signature = JSON.stringify([choices,state.release]);
      if (signature !== releaseSignature) {
        releaseSignature = signature;
        root.getElementById('releases').replaceChildren(...choices.map(([value,label])=>{const b=document.createElement('button');b.textContent=label;b.dataset.release=value;b.setAttribute('aria-pressed',String(value===state.release));return b;}));
      }
      for (const name of ['relation','review','comments','ci','draft','sort','me']) if (root.activeElement !== root.getElementById(name)) root.getElementById(name).value = state[name];
      renderSummary(list);
      const sorted = state.sort === 'native' ? list : [...list].sort(compare);
      let visible = 0;
      sorted.forEach((item,index)=>{
        const {row,section,data}=item;
        row.setAttribute('data-gv-card','');
        if (!modified.has(row)) modified.set(row,row.style.order);
        if (state.sort !== 'native') row.style.order=String(index);
        if (matches(item)) visible++; else row.setAttribute('data-gv-hidden','');
        let badge=section.querySelector('.gv-pr-review-info');
        if (!badge) { badge=document.createElement('p');badge.className='gv-pr-review-info';section.append(badge); }
        const info=reviewInfo(data);
        const discussion = discussions.get(item.id);
        const pieces = [];
        if (info) {
          if (info.changes) pieces.push([`✕ Нужны доработки: ${info.changes}`, 'bad', 'Ревьюеры запросили изменения']);
          pieces.push([info.approvals ? `✓ Approve: ${info.approvals}` : 'Нет approve', info.approvals ? 'good' : '', 'Число актуальных одобрений; не гарантирует готовность к слиянию']);
          if (info.pending) pieces.push([`◷ Ожидают ревью: ${info.pending}`, 'warn', 'Запрошено ревью']);
          if (info.waiting) pieces.push(['Ждёт твоего ревью', 'warn', '']);
          if (info.approved) pieces.push(['Ты одобрил', 'good', '']);
        } else pieces.push(['Ревью: нет данных', '', '']);
        if (discussion?.value) {
          const d = discussion.value;
          pieces.push([`Открытые замечания: ${d.open}`, d.open ? 'bad' : '', 'Уникальные нерешённые ветки замечаний к коду', `${repo}/pulls/${item.id}/files`]);
          if (d.unknown) pieces.push([`Статус неизвестен: ${d.unknown}`, 'warn', 'У веток отсутствует признак решения']);
          pieces.push([`Решено: ${d.resolved}`, d.resolved ? 'good' : '', 'Ветки, отмеченные решёнными в GitVerse', `${repo}/pulls/${item.id}/files`]);
          pieces.push([`Комментарии: ${d.comments}`, '', 'Сообщения людей, включая ответы и текст ревью. Системные события исключены.', `${repo}/pulls/${item.id}`]);
        } else pieces.push([discussion?.error ? 'Замечания: ошибка загрузки' : 'Замечания: загрузка…', '', 'Обновить можно кнопкой «Обновить статусы»']);
        const badgeSignature = JSON.stringify(pieces);
        if (badge.dataset.signature !== badgeSignature) {
          badge.dataset.signature = badgeSignature;
          badge.replaceChildren(...pieces.map(([text,tone,title,href])=>{const el=document.createElement(href?'a':'span');el.textContent=text;el.dataset.tone=tone;el.title=title;if(href)el.href=href;return el;}));
        }
        renderPreview(item, discussion);
      });
      for (const row of modified.keys()) if (!row.isConnected) modified.delete(row);
      root.getElementById('status').textContent=`Показано ${visible} из ${list.length} PR на текущей странице. ${loading?'Загружаю статусы…':error||'Approve означает хотя бы одно одобрение, не готовность к слиянию. «—» / «+» в сводке: часть данных ещё неизвестна.'}`;
      root.getElementById('refresh').disabled=loading || commentsLoading;
      if (!lastLoad && !loading) void refresh();
      else if (!loading && !commentsLoading) void loadComments();
    } finally { observer.observe(document.body,{childList:true,subtree:true,characterData:true}); }
  }
  function schedule() { if (!frame) frame=requestAnimationFrame(render); }
  async function get(path) { const response=await fetch(path,{credentials:'same-origin',signal:AbortSignal.timeout(15000)}); if (!response.ok) throw new Error(String(response.status)); return response.json(); }
  function previewMessages(events) {
    return events.filter(c=>['comment','code','review'].includes(c.type) && typeof c.body==='string' && c.body.trim())
      .map(c=>({id:c.id,type:c.type,body:c.body,author:c.poster?.username||c.poster?.login||'Неизвестный автор',
        created:c.createdAt,threadId:c.threadId||0,path:c.treePath||'',
        resolved:typeof c.thread?.ResolvedUnix==='number'?c.thread.ResolvedUnix>0:null,
        threadUpdated:c.thread?.UpdatedUnix||0}));
  }
  function renderPreview(item, discussion) {
    let host=item.section.querySelector('.gv-pr-preview');
    if (!discussion?.messages?.length) { host?.remove(); return; }
    if (!host) {
      host=document.createElement('div');host.className='gv-pr-preview';item.section.append(host);
      const shadow=host.attachShadow({mode:'open'});
      shadow.innerHTML=`<style>
        :host{display:block;margin-top:10px;font:12px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#c9d1d9;color-scheme:dark}
        details{border:1px solid #30363d;border-radius:6px;background:#0d1117}
        summary{cursor:pointer;padding:8px 12px;color:#58a6ff;font-weight:500}summary:hover{background:#161b22}
        summary:focus-visible,a:focus-visible{outline:2px solid #58a6ff;outline-offset:2px}
        #content{border-top:1px solid #30363d;max-height:560px;overflow:auto;padding:12px;display:grid;gap:12px}
        article{border:1px solid #30363d;border-radius:6px;overflow:hidden}
        header{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:7px 10px;background:#161b22}
        .state{font-size:11px;border:1px solid #30363d;border-radius:12px;padding:1px 7px}
        .open{color:#f85149;border-color:#f8514966}.resolved{color:#3fb950;border-color:#23863680}
        .path{font-family:ui-monospace,monospace;font-size:11px;overflow-wrap:anywhere;color:#8b949e}
        a{color:#58a6ff;text-decoration:none;margin-left:auto}a:hover{text-decoration:underline}
        .message{padding:10px 12px;border-top:1px solid #21262d}.meta{color:#8b949e;font-size:11px;display:flex;gap:8px;flex-wrap:wrap}
        strong{color:#c9d1d9}pre{font:12px/1.6 ui-monospace,SFMono-Regular,Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere;margin:8px 0 0}
        .note{margin:0;color:#8b949e;font-size:11px}
      </style><details><summary></summary><div id="content"></div></details>`;
      shadow.querySelector('details').addEventListener('toggle',()=>{
        if(shadow.querySelector('details').open) populatePreview(host,item.id);
      });
    }
    const summary=host.shadowRoot.querySelector('summary');
    const label=`Предпросмотр замечаний и комментариев · ${discussion.messages.length}`;
    if(summary.textContent!==label)summary.textContent=label;
    if(host.shadowRoot.querySelector('details').open)populatePreview(host,item.id);
  }
  function populatePreview(host,id) {
    const messages=discussions.get(id)?.messages||[];
    const signature=JSON.stringify(messages);
    if(host.previewSignature===signature)return;host.previewSignature=signature;
    const groups=new Map();
    for(const message of messages){
      const key=message.threadId?`thread:${message.threadId}`:`message:${message.id}`;
      if(!groups.has(key))groups.set(key,{messages:[],resolved:message.resolved,updated:message.threadUpdated,path:message.path,thread:!!message.threadId||message.type==='code'});
      const group=groups.get(key);group.messages.push(message);
      if(message.threadUpdated>=group.updated){group.resolved=message.resolved;group.updated=message.threadUpdated;}
    }
    const rank=g=>g.thread?(g.resolved===false?0:g.resolved===null?1:3):2;
    const sorted=[...groups.values()].sort((a,b)=>rank(a)-rank(b));
    const content=host.shadowRoot.getElementById('content');
    const note=document.createElement('p');note.className='note';note.textContent='Сначала открытые замечания. Текст показан как написан автором, без обработки Markdown.';
    content.replaceChildren(note,...sorted.map(group=>{
      const article=document.createElement('article'),header=document.createElement('header'),status=document.createElement('span');
      status.className='state';
      if(!group.thread)status.textContent='Комментарий';
      else if(group.resolved===true){status.textContent='Решено';status.classList.add('resolved');}
      else if(group.resolved===false){status.textContent='Открыто';status.classList.add('open');}
      else status.textContent='Статус неизвестен';
      header.append(status);
      if(group.path){const path=document.createElement('span');path.className='path';path.textContent=group.path;header.append(path);}
      const link=document.createElement('a');link.href=`${repo}/pulls/${id}${group.thread?'/files':''}`;link.textContent=group.thread?'Открыть изменения ↗':'Открыть PR ↗';link.target='_blank';link.rel='noopener noreferrer';header.append(link);article.append(header);
      group.messages.sort((a,b)=>String(a.created).localeCompare(String(b.created))||Number(a.id)-Number(b.id));
      for(const message of group.messages){
        const block=document.createElement('div');block.className='message';const meta=document.createElement('div');meta.className='meta';
        const author=document.createElement('strong');author.textContent=message.author;meta.append(author);
        const date=new Date(message.created);if(!Number.isNaN(date.getTime())){const time=document.createElement('time');time.dateTime=date.toISOString();time.textContent=date.toLocaleString('ru-RU',{dateStyle:'short',timeStyle:'short'});meta.append(time);}
        const body=document.createElement('pre');body.textContent=message.body;block.append(meta,body);article.append(block);
      }
      return article;
    }));
  }
  function countComments(events) {
    if (!Array.isArray(events)) throw new Error('Unexpected comments response');
    const threads = new Map();
    let comments = 0;
    for (const c of events) {
      if (['comment', 'code', 'review'].includes(c.type) && typeof c.body === 'string' && c.body.trim()) comments++;
      if (c.threadId > 0 && ['code', 'comment'].includes(c.type)) {
        const previous = threads.get(c.threadId);
        const updated = c.thread?.UpdatedUnix ?? 0;
        if (!previous || updated >= previous.updated) threads.set(c.threadId, { updated, resolved: typeof c.thread?.ResolvedUnix === 'number' ? c.thread.ResolvedUnix > 0 : null });
      } else if (c.type === 'code') threads.set(`comment:${c.id}`, {resolved:null});
    }
    const values = [...threads.values()];
    return { comments, open: values.filter(t=>t.resolved===false).length, resolved: values.filter(t=>t.resolved===true).length, unknown: values.filter(t=>t.resolved===null).length };
  }
  async function loadComments(force=false) {
    if (commentsLoading || !onList()) return;
    const queue=rows().filter(item=>force || !discussions.has(item.id));
    if (!queue.length) return;
    commentsLoading=true;
    // Два одновременных запроса; результаты живут в памяти вкладки до обновления статусов.
    await Promise.all([0,1].map(async()=>{
      while (queue.length && onList()) {
        const item=queue.shift();
        try { const events=await get(`/sbt/api/v1/repos${repo}/pulls/${item.id}/comments`);discussions.set(item.id,{value:countComments(events), messages:previewMessages(events)}); }
        catch { discussions.set(item.id,{error:true}); }
        schedule();
      }
    }));
    commentsLoading=false;schedule();
  }
  async function refresh() {
    if (loading || commentsLoading || !onList()) return;
    loading=true;error='';lastLoad=Date.now();schedule();
    try {
      const result=await get(`/sbt/api/v1/repos${repo}/pulls`);
      if (!Array.isArray(result.data)) throw new Error('Unexpected response');
      metadata.clear();
      result.data.forEach(p=>metadata.set(String(p.number),p));
      // Не делаем запрос на каждый PR: дополнительные чтения нужны только за пределами первой страницы API.
      for (const item of rows()) if (!metadata.has(item.id)) {
        const p=await get(`/sbt/api/v1/repos${repo}/pulls/${item.id}`);
        if (p.number && Array.isArray(p.reviewers)) metadata.set(item.id,p);
      }
    } catch { metadata.clear();error='Не удалось загрузить ревью. Нажми «Обновить статусы»; неизвестные статусы не считаются отсутствием approve.'; }
    finally { loading=false;await loadComments(true);schedule(); }
  }
  function save() { try {localStorage.setItem(key,JSON.stringify(state));} catch {} render(); }
  root.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.metric){
      const keep={me:state.me,sort:state.sort};state={...defaults,...keep,theme:state.theme,release:b.dataset.version};
      const filters={approved:['review','yes'],waiting:['relation','waiting'],changes:['review','changes'],open:['comments','open'],ci:['ci','failed'],draft:['draft','yes']};
      const filter=filters[b.dataset.metric];if(filter)state[filter[0]]=filter[1];save();return;
    }
    if(b.dataset.release){state.release=b.dataset.release;save();}
    if(b.id==='reset'){state={...defaults,me:state.me,theme:state.theme};save();}
    if(b.id==='refresh')void refresh();
  });
  root.addEventListener('change',e=>{if(Object.hasOwn(defaults,e.target.id)){state[e.target.id]=e.target.type==='checkbox'?e.target.checked:e.target.value;save();}});
  window.addEventListener('popstate',schedule);
  window.addEventListener('focus',()=>{if(Date.now()-lastLoad>60000)void refresh();});
  window.addEventListener('pagehide',()=>{observer.disconnect();cancelAnimationFrame(frame);frame=0;});
  window.addEventListener('pageshow',schedule);
  render();
})();
