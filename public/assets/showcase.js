/* URZ STUDIO — kinetic portfolio interactions, no dependency or build step */
(() => {
  'use strict';
  const doc = document;
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => doc.querySelector(s), $$ = s => Array.from(doc.querySelectorAll(s));
  const setTheme = mode => {
    doc.body.classList.toggle('theme-dark',mode==='dark');
    $$('#themeToggle').forEach(b=>{
      b.textContent=mode==='dark'?'☀':'☾';
      b.setAttribute('aria-label',mode==='dark'?'라이트 모드로 전환':'다크 모드로 전환');
    });
    try{localStorage.setItem('urz-theme',mode)}catch{}
  };
  let initialTheme='light';
  try{initialTheme=localStorage.getItem('urz-theme')||'light'}catch{}
  setTheme(initialTheme);
  const themeBtn=$('#themeToggle');
  themeBtn?.addEventListener('click',()=>setTheme(doc.body.classList.contains('theme-dark')?'light':'dark'));

  const menuBtn=$('#menuToggle'), nav=$('#siteNav');
  menuBtn?.addEventListener('click',()=>{
    const open=nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded',String(open));
    menuBtn.textContent=open?'✕':'☰';
  });
  nav?.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('open');menuBtn?.setAttribute('aria-expanded','false');if(menuBtn)menuBtn.textContent='☰'}});

  $$('.year').forEach(el=>{el.textContent=String(new Date().getFullYear())});
  window.urzToast = message => {
    let wrap=$('.toast-wrap');
    if(!wrap){wrap=doc.createElement('div');wrap.className='toast-wrap';doc.body.append(wrap)}
    const el=doc.createElement('div');el.className='toast';el.textContent=String(message);
    wrap.replaceChildren(el);
    clearTimeout(window.__urzToastTimer);
    window.__urzToastTimer=setTimeout(()=>{if(el.parentNode)el.remove()},3500);
  };

  let scrollTick=false;
  function updateScroll(){
    if(scrollTick)return;
    scrollTick=true;
    requestAnimationFrame(()=>{
      const total=doc.documentElement.scrollHeight-window.innerHeight;
      const ratio=total>0?Math.max(0,Math.min(1,window.scrollY/total)):0;
      const progress=$('#scrollProgress');
      if(progress)progress.style.transform='scaleX('+ratio+')';
      scrollTick=false;
    });
  }
  window.addEventListener('scroll',updateScroll,{passive:true});updateScroll();

  if(!isReduced && window.matchMedia('(pointer:fine)').matches){
    let pointerTick=false, px=innerWidth/2, py=innerHeight/2;
    window.addEventListener('pointermove',e=>{
      px=e.clientX;py=e.clientY;
      if(pointerTick)return;
      pointerTick=true;
      requestAnimationFrame(()=>{
        doc.documentElement.style.setProperty('--pointer-x',px+'px');
        doc.documentElement.style.setProperty('--pointer-y',py+'px');
        pointerTick=false;
      });
    },{passive:true});
  }

  if('IntersectionObserver' in window && !isReduced){
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}
      }
    },{threshold:.08,rootMargin:'0px 0px -24px 0px'});
    $$('.reveal,.stagger').forEach(el=>observer.observe(el));
  }else{$$('.reveal,.stagger').forEach(el=>el.classList.add('visible'))}

  function maybeParallax(el) {
    if(!el || isReduced || !window.matchMedia('(pointer:fine)').matches)return;
    el.addEventListener('pointermove', e => {
      const r=el.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      el.style.transform='perspective(1000px) rotateX('+(-y*3)+'deg) rotateY('+(x*4)+'deg) translateY(-7px)';
    },{passive:true});
    el.addEventListener('pointerleave',()=>{el.style.transform='';});
    el.addEventListener('blur',()=>{el.style.transform='';});
  }
  $$('.floating-product').forEach(el=>maybeParallax(el));

  const galleryURL = 'gallery.html';
  // Projects are all independent portfolio artifacts; ANIMA Bridge has its own dedicated case study.
  const projects=[
    {id:'bearstory',title:'BEARSTORY',kind:'WEB APPLICATION',category:'web',color:'straw',type:'story',year:'2026',summary:'이미지를 페이지로, 페이지를 이야기로. CG 스토리북과 4컷을 설계하는 창작 편집기.',features:['CG 스토리북 · 4컷 만화 · 웹툰 편집','말풍선·텍스트·페이지 순서 배치','PDF / CBZ / ZIP 내보내기'],tags:['UI / UX','WEB APP','EDITOR'],url:'https://bearstory.kro.kr/',linkLabel:'웹앱 보기'},
    {id:'bearstory-ext',title:'BEARSTORY EXT',kind:'BROWSER EXTENSION',category:'extension',color:'mint',type:'library',year:'2026',summary:'편집과 보관, PDF·CBZ 감상까지. 브라우저 안의 개인 창작 라이브러리.',features:['로컬 전용 CG · 4컷 · 웹툰 · 웹소설 편집','컬렉션 정리와 시청관','PDF·CBZ 리더'],tags:['EXTENSION','LOCAL FIRST','READER']},
    {id:'video',title:'ANIMA VideoAPI',kind:'AI VIDEO TOOL',category:'ai',color:'blue',type:'video',year:'2026',summary:'AI 영상 생성의 비용 확인부터 작업 대기열과 결과 보관까지 한곳에서.',features:['생성 모델 선택 · 시작/끝 프레임','실제 견적·비용 확인','대기열과 결과 보관함'],tags:['AI VIDEO','PRODUCT UI','WORKFLOW']},
    {id:'scene',title:'Scene Bridge',kind:'BROWSER EXTENSION',category:'extension',color:'rose',type:'scene',year:'2026',summary:'대화 맥락을 이미지 생성 작업으로 연결하는 개인 브라우저 확장.',features:['대화 기반 장면 분석','Grok ↔ SwarmUI 연결','메시지별 이미지 생성 작업'],tags:['EXTENSION','AI','AUTOMATION']},
    {id:'unified',title:'bEAR-STORY+EXT',kind:'INTEGRATION BUILD',category:'extension',color:'lavender',type:'merge',year:'2026',summary:'생성, 편집, 감상을 오가는 동선을 통합하는 확장 빌드 프로젝트.',features:['ANIMA·VideoAPI·BEARSTORY 통합','통합 사이드바 정보 설계','Windows 설치·업데이트 빌더'],tags:['INTEGRATION','UI SYSTEM','EXTENSION']},
    {id:'hoi',title:'HOI4 Modding',kind:'PERSONAL PROJECT',category:'personal',color:'slate',type:'map',year:'2026',summary:'전략 게임의 데이터·규칙·콘텐츠 구조를 탐구한 개인 모딩 작업.',features:['전략 게임 시스템 탐구','설정 및 데이터 구조 설계','개인 콘텐츠 제작'],tags:['MODDING','SYSTEMS','EXPERIMENT']}
  ];
  const dots='<i></i><i></i><i></i>';
  const sidebar='<div class="u-side"><i></i><i></i><i></i></div>';
  function graphic(p){
    let middle='';
    switch(p.type){
      case 'story':middle='<div class="u-content"><div class="u-heading">STORY BOARD / 4 CUTS</div><div class="u-comic">'+ '<i></i>'.repeat(4)+'</div></div>';break;
      case 'library':middle='<div class="u-content"><div class="u-heading">MY COLLECTION / READER</div><div class="u-library">'+ '<i></i>'.repeat(4)+'</div></div>';break;
      case 'video':middle='<div class="u-content"><div class="u-heading">VIDEO WORKSPACE / QUEUE</div><div class="u-video">▷</div><div class="u-queue"><i></i><i></i><i></i></div></div>';break;
      case 'scene':middle='<div class="u-content"><div class="u-heading">CONVERSATION → SCENE</div><div class="u-scene"><div class="u-bubbles"><i></i><i></i><i></i></div><div class="u-generated">SCENE<br>OUTPUT</div></div></div>';break;
      case 'merge':middle='<div class="u-content"><div class="u-heading">UNIFIED WORKSPACE</div><div class="u-merge"><div>IMAGE</div><div>STORY</div><div>VIDEO</div></div></div>';break;
      default:middle='<div class="u-content"><div class="u-heading">MOD / STRATEGY DATA</div><div class="u-map"></div></div>';
    }
    return '<div class="ui-window"><div class="u-top">'+dots+'<b>'+p.title.toUpperCase()+'</b></div><div class="u-body">'+(p.type==='scene'?'':sidebar)+middle+'</div></div>';
  }
  window.URZ_PROJECTS=projects;
  function card(p,idx=0){
    const b=doc.createElement('button');
    b.type='button';b.className='work-card'+(idx===0?' featured':idx===1?' narrow':'');
    b.dataset.project=p.id;b.dataset.category=p.category;b.setAttribute('aria-label',p.title+' 프로젝트 상세 보기');
    b.innerHTML='<div class="work-illustration '+p.color+'"><span class="floating-label">UI CONCEPT / '+p.year+'</span>'+graphic(p)+'</div>'
    +'<div class="work-info"><div class="work-info-top"><span>'+p.kind+'</span><span>0'+(idx+1)+' / 06</span></div><h3></h3><p></p><div class="work-info-bottom"><div class="work-tags"></div><span class="work-arrow">↗</span></div></div>';
    b.querySelector('h3').textContent=p.title;
    b.querySelector('.work-info>p').textContent=p.summary;
    const tags=b.querySelector('.work-tags');
    p.tags.slice(0,3).forEach(t=>{const el=doc.createElement('i');el.textContent=t;tags.append(el)});
    return b;
  }
  const homeGrid=$('#featuredWorks');
  if(homeGrid){homeGrid.replaceChildren(...projects.slice(0,4).map((p,i)=>card(p,i)));}
  const projectGrid=$('#projectsGrid');
  if(projectGrid){
    projectGrid.replaceChildren(...projects.map((p,i)=>card(p,i)));
    $$('.filter-row button[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{
      const filter=btn.dataset.filter;
      $$('.filter-row button[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
      $$('#projectsGrid .work-card').forEach(b=>{b.hidden=filter!=='all'&&b.dataset.category!==filter});
    }));
  }
  const details=$('#projectDetail');
  function showDetail(id){
    const p=projects.find(x=>x.id===id);if(!p||!details)return;
    details.querySelector('[data-detail-kind]').textContent=p.kind;
    details.querySelector('[data-detail-title]').textContent=p.title;
    details.querySelector('[data-detail-summary]').textContent=p.summary;
    details.querySelector('[data-detail-features]').replaceChildren(...p.features.map(v=>{const li=doc.createElement('li');li.textContent=v;return li}));
    const ext=details.querySelector('[data-detail-link]');
    if(ext){ext.hidden=!p.url;if(p.url){ext.href=p.url;ext.textContent=p.linkLabel+' ↗'}}
    details.hidden=false;doc.body.style.overflow='hidden';details.querySelector('.close')?.focus();
  }
  doc.addEventListener('click',e=>{const tile=e.target.closest('button[data-project]');if(tile)showDetail(tile.dataset.project)});
  details?.addEventListener('click',e=>{if(e.target===details||e.target.closest('[data-close-detail]')){details.hidden=true;doc.body.style.overflow=''}});
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&details&&!details.hidden){details.hidden=true;doc.body.style.overflow=''}});

  const tabList=$$('.anima-tabs button[data-anima-tab]');
  const modeContent={
    image:{title:'IMAGE GENERATION',caption:'PROMPT → SWARMUI → ARTWORK',side:'● 이미지 생성',sublabel:'01 / IMAGE WORKSPACE'},
    gallery:{title:'ARTWORK LIBRARY',caption:'RESULTS → SEARCH → COLLECTION',side:'● 갤러리·보관함',sublabel:'02 / ASSET LIBRARY'},
    queue:{title:'WORK QUEUE',caption:'REQUEST → STATUS → RESULT',side:'● 생성 대기열',sublabel:'03 / JOB QUEUE'}
  };
  tabList.forEach(btn=>btn.addEventListener('click',()=>{
    const d=modeContent[btn.dataset.animaTab];if(!d)return;
    tabList.forEach(b=>b.setAttribute('aria-selected',String(b===btn)));
    const stage=$('.anima-stage');if(stage){stage.dataset.mode=btn.dataset.animaTab;stage.querySelector('.stage-label').textContent=d.caption}
    const title=$('[data-anima-title]');if(title)title.textContent=d.title;
    const sub=$('[data-anima-sub]');if(sub)sub.textContent=d.sublabel;
    const s=$('[data-anima-selected]');if(s)s.textContent=d.side;
  }));

  // No network dependencies. Cross-document navigation uses the browser View Transitions API when available.
  // Keep all interactions keyboard accessible and reduced-motion safe.
})();