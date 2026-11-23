/* URZ Studio Public Gallery — R2 images + D1 searchable metadata, admin-only publishing. */
(async function(){
'use strict';
const $=id=>document.getElementById(id), apiBase='/api', notify=s=>window.urzToast?.(s);
const state={items:[],albums:[],models:[],total:0,offset:0,limit:36,search:'',album:'all',model:'all',sort:'newest',selected:null,secret:sessionStorage.getItem('urz-gallery-admin')||'',authorized:false,requestId:0,loading:false};
const text=(node,value)=>{node.textContent=String(value??'')};
function node(tag,cls,value){const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)text(n,value);return n}
const modalOpeners = new WeakMap();
let retryAppend = null;
function show(id, opener = document.activeElement) {
 const dialog = $(id);
 if (dialog.open) return;
 modalOpeners.set(dialog, opener);
 dialog.scrollTop = 0;
 dialog.showModal();
}
function close(id) {
 const dialog = $(id), opener = modalOpeners.get(dialog);
 if (!dialog.open) return;
 dialog.close();
 if (opener?.isConnected && !opener.closest('[hidden]') && opener !== document.body) opener.focus();
 else if (id === 'adminModal' && state.authorized) $('adminLogout').focus();
 else if (id === 'galleryLightbox') $('gallerySearch').focus();
}
function safeJSON(s){try{return JSON.parse(s)}catch{return null}}
async function req(path,opts={}){
 const headers={...(opts.headers||{})};
 if(state.secret&&opts.method&&opts.method!=='GET')headers.Authorization='Bearer '+state.secret;
 if(opts.auth)headers.Authorization='Bearer '+state.secret;
 const resp=await fetch(apiBase+path,{...opts,headers,cache:'no-store',credentials:'same-origin'});
 const data=await resp.json().catch(()=>({}));
 if(!resp.ok)throw Object.assign(new Error(data.error||`서버 오류 (${resp.status})`),{status:resp.status,existingId:data.existingId});
 return data;
}
const lexicon={
 '곰':'bear teddy plush','곰돌이':'bear teddy plush','인형':'doll plush toy teddy','하얀':'white ivory','흰':'white ivory','백색':'white','검정':'black dark','검은':'black dark','분홍':'pink rose','빨강':'red crimson','빨간':'red','초록':'green forest','파랑':'blue navy','파란':'blue','보라':'purple violet','노랑':'yellow','주황':'orange','여자':'woman female girl','여성':'woman female','남자':'man male boy','남성':'man male','얼굴':'face portrait','인물':'portrait person girl woman','미소':'smile smiling','웃음':'laugh smile','눈':'eyes eye','머리':'hair head','긴머리':'long hair','단발':'short hair bob','드레스':'dress gown','교복':'uniform school','스웨터':'sweater knit','옷':'clothing outfit','도시':'city urban downtown','건물':'building architecture','건축':'architecture building','밤':'night evening darkness','야경':'night city lights','낮':'day daylight','아침':'morning sunrise','저녁':'evening dusk sunset','노을':'sunset dusk twilight','해질녘':'sunset twilight','하늘':'sky clouds','구름':'cloud sky','바다':'ocean sea water','호수':'lake water','강':'river water','산':'mountain landscape','숲':'forest trees woods','나무':'tree forest','꽃':'flower blossom floral','벚꽃':'cherry blossom sakura pink','정원':'garden flowers','자연':'nature landscape forest','풍경':'landscape scenery vista','배경':'background backdrop','흐림':'cloudy fog mist','비':'rain rainy','눈내림':'snow snowfall winter','겨울':'winter snow','봄':'spring blossom','여름':'summer sunny','가을':'autumn fall foliage','사진':'photo photography photorealistic','실사':'photorealistic realistic photo','일러스트':'illustration artwork drawing','애니':'anime illustration','그림':'art drawing painting','캐릭터':'character illustration','판타지':'fantasy magic dreamy','귀여운':'cute adorable kawaii','예쁜':'beautiful pretty gorgeous','아름다운':'beautiful elegant','부드러운':'soft gentle delicate','포근한':'cozy soft warm','따뜻한':'warm cozy sunlit','차가운':'cold cool blue','밝은':'bright light','어두운':'dark moody','조명':'lighting light lamp','빛':'light glow luminous','네온':'neon lights','영화':'cinematic film','고화질':'high quality detailed 4k','세밀한':'detailed intricate','디테일':'details intricate','렌더':'render 3d','쓰리디':'3d render','카메라':'camera lens photography','렌즈':'lens camera','클로즈업':'close-up portrait','전신':'full body standing','책':'book reading','방':'room interior','실내':'interior indoor','인테리어':'interior room','커피':'coffee cup cafe','동물':'animal creature','강아지':'dog puppy','고양이':'cat kitten','새':'bird','식물':'plant foliage','메카':'mecha robot','로봇':'robot mechanical','미래':'future futuristic sci-fi','우주':'space galaxy stars','별':'stars starlight','자동차':'car vehicle','거리':'street road','길':'road path street','모델':'model checkpoint','시드':'seed','스텝':'steps','샘플러':'sampler','화질':'resolution quality','세로':'portrait vertical','가로':'landscape horizontal'};
const inverse=new Map();for(const [ko,en] of Object.entries(lexicon))for(const word of en.split(' ')){if(word.length<3)continue;const arr=inverse.get(word)||[];arr.push(ko);inverse.set(word,arr)}
function searchTokens(q){const raw=q.toLowerCase().trim().split(/\s+/).filter(Boolean);return raw.map(t=>{const set=new Set([t]);if(lexicon[t])lexicon[t].split(' ').forEach(v=>set.add(v));if(inverse.has(t))inverse.get(t).forEach(v=>set.add(v));return [...set]})}
function norm(x){return String(x??'').normalize('NFKC').toLowerCase()}
function parseLatin(bytes){return new TextDecoder('latin1').decode(bytes)}
async function parsePNG(file){const raw={};if(file.size>100*1024*1024){raw.notice='100MB 이상이므로 메타데이터 검색을 생략함';return raw}const buf=await file.arrayBuffer();const dv=new DataView(buf),u=new Uint8Array(buf);if(u.length<24||[137,80,78,71,13,10,26,10].some((n,i)=>u[i]!==n))return raw;let off=8;for(let safety=0;off+12<=buf.byteLength&&safety<600;safety++){const size=dv.getUint32(off);if(size>buf.byteLength-off-12)break;const type=parseLatin(u.slice(off+4,off+8)),data=u.slice(off+8,off+8+size);if(type==='tEXt'||type==='iTXt'||type==='zTXt'){
  const zero=data.indexOf(0);if(zero>0){const key=parseLatin(data.slice(0,zero));let value='';try{
   if(type==='tEXt')value=new TextDecoder('utf-8').decode(data.slice(zero+1));
   else if(type==='zTXt'){if('DecompressionStream'in window){const stream=new Blob([data.slice(zero+2)]).stream().pipeThrough(new DecompressionStream('deflate'));value=await new Response(stream).text()}else value='[압축된 메타데이터: 브라우저에서 압축 해제 미지원]'}
   else{const compressed=data[zero+1]===1;let p=zero+3;let z=data.indexOf(0,p);if(z<0)continue;p=z+1;z=data.indexOf(0,p);if(z<0)continue;p=z+1;const content=data.slice(p);if(compressed&&'DecompressionStream'in window){const stream=new Blob([content]).stream().pipeThrough(new DecompressionStream('deflate'));value=await new Response(stream).text()}else if(!compressed)value=new TextDecoder('utf-8').decode(content);else value='[압축된 iTXt 메타데이터]'}
  }catch(e){value='[메타데이터 읽기 오류: '+e.message+']'}raw[key]=value.slice(0,150000)}
 }off+=size+12;if(type==='IEND')break}return raw}
async function parseWebP(file){const raw={};const buf=await file.arrayBuffer();const u=new Uint8Array(buf);if(u.length<16||parseLatin(u.slice(0,4))!=='RIFF'||parseLatin(u.slice(8,12))!=='WEBP')return raw;let i=12;while(i+8<=u.length){const type=parseLatin(u.slice(i,i+4)),n=new DataView(buf).getUint32(i+4,true);if(n>u.length-i-8)break;if(type==='XMP '||type==='EXIF'){const str=new TextDecoder('utf-8',{fatal:false}).decode(u.slice(i+8,i+8+Math.min(n,80000)));raw[type.trim()]=str}i+=8+n+(n%2)}return raw}
async function parseJPEG(file){const raw={};const u=new Uint8Array(await file.slice(0,2*1024*1024).arrayBuffer());if(u.length<4||u[0]!==255||u[1]!==216)return raw;let p=2;while(p+4<u.length){if(u[p]!==255)break;const marker=u[p+1],len=(u[p+2]<<8)|u[p+3];if(len<2||p+2+len>u.length)break;if(marker===0xe1||marker===0xfe){const txt=new TextDecoder('utf-8',{fatal:false}).decode(u.slice(p+4,p+2+len));if(/prompt|seed|exif|workflow|parameters|xmp/i.test(txt))raw[marker===0xe1?'APP1/EXIF':'Comment']=txt.slice(0,80000)}p+=2+len}return raw}
function parseMeta(raw){
 const out={prompt:'',negative:'',model:'',seed:'',steps:'',cfg:'',sampler:'',loras:'',width:'',height:''};
 const keyDefs={
  prompt:['positiveprompt','positive','prompt','textprompt','description'],
  negative:['negativeprompt','negative','negativeconditioning'],
  model:['model','modelname','checkpoint','ckptname','basemodel'],
  seed:['seed','randomseed'], steps:['steps','stepcount','samplingsteps'],
  cfg:['cfgscale','cfg','guidancescale','guidance'],
  sampler:['sampler','samplername','samplingmethod'],
  loras:['loras','lora'],width:['width','imagewidth'],height:['height','imageheight']
 };
 const normalizeKey=k=>String(k).toLowerCase().replace(/[^a-z0-9]/g,'');
 const seen=new WeakSet();
 function visit(obj,depth=0){
   if(!obj||typeof obj!=='object'||depth>8||seen.has(obj))return;
   seen.add(obj);
   if(Array.isArray(obj)){for(const v of obj.slice(0,100))visit(v,depth+1);return;}
   for(const [key,val] of Object.entries(obj)){
     const kn=normalizeKey(key);
     for(const [field,aliases] of Object.entries(keyDefs)){
       if(aliases.includes(kn)&&!out[field]){
         if(typeof val==='string'||typeof val==='number')out[field]=String(val).slice(0,24000);
         else if(field==='loras'&&Array.isArray(val))out[field]=val.map(x=>typeof x==='string'?x:x?.name||x?.model||'').join(', ');
       }
     }
     if(val&&typeof val==='object')visit(val,depth+1);
     else if(typeof val==='string'&&val.length<180000&&/^[\s]*[\[{]/.test(val)){
       try{visit(JSON.parse(val),depth+1)}catch{}
     }
   }
 }
 visit(raw);
 for(const [key,value] of Object.entries(raw)){
   if(typeof value!=='string')continue;
   const s=value.trim();
   if(key==='parameters'||/parameters|generation data|comment/i.test(key)){
     const prompt=s.split(/\nNegative prompt:|\nSteps:/i)[0];
     if(!out.prompt&&prompt.length<20000&&!prompt.startsWith('{'))out.prompt=prompt;
     const neg=s.match(/Negative prompt:\s*([\s\S]+?)(?:\nSteps:|$)/i);
     if(!out.negative&&neg)out.negative=neg[1].trim();
     const regexes={steps:/\bSteps:\s*(\d+)/i,seed:/\bSeed:\s*([0-9]+)/i,cfg:/\bCFG scale:\s*([\d.]+)/i,model:/\bModel:\s*([^,\n]+)/i,sampler:/\bSampler:\s*([^,\n]+)/i};
     for(const [field,rx] of Object.entries(regexes))if(!out[field])out[field]=s.match(rx)?.[1]||'';
   }
 }
 return out;
}
function extractTags(meta){const words=(meta.prompt||'').split(/[,\n]/).map(s=>s.trim()).filter(x=>x&&x.length<55);return words.slice(0,8)}
async function dimensions(file){try{const img=await createImageBitmap(file);const obj={width:img.width,height:img.height};img.close();return obj}catch{return await new Promise(resolve=>{const url=URL.createObjectURL(file),img=new Image;img.onload=()=>{const z={width:img.naturalWidth,height:img.naturalHeight};URL.revokeObjectURL(url);resolve(z)};img.onerror=()=>{URL.revokeObjectURL(url);resolve({width:0,height:0})};img.src=url})}}

function setAuthor(yes){state.authorized=!!yes;document.querySelectorAll('.owner-only').forEach(x=>x.hidden=!yes);
 $('adminLogin').hidden=!!yes;$('adminLogout').hidden=!yes;$('adminStatus').hidden=!yes;
 for(const id of ['editTitleWrap','editTagsWrap','editAlbumWrap','saveArtwork','deleteArtwork'])$(id).hidden=!yes;
}
function syncAlbumButtons() {
 for (const button of $('albumBar').children) {
  button.setAttribute('aria-pressed', String(button.dataset.album === state.album));
 }
}
function albumsSelect() {
 const select = $('uploadAlbum'), selected = select.value;
 select.replaceChildren(new Option('앨범 지정 안 함', ''));
 for (const album of state.albums) select.add(new Option(album.name, album.id));
 if (state.albums.some(album => album.id === selected)) select.value = selected;

 const bar = $('albumBar'), focused = bar.contains(document.activeElement) && document.activeElement.dataset.album;
 bar.replaceChildren();
 for (const album of [{id:'all', name:'전체 앨범'}, {id:'unfiled', name:'미분류'}, ...state.albums]) {
  const button = node('button', 'album-pill', album.name + (album.count === undefined ? '' : ' · ' + album.count));
  button.type = 'button';
  button.dataset.album = album.id;
  bar.append(button);
 }
 syncAlbumButtons();
 if (focused) ([...bar.children].find(button => button.dataset.album === focused) || bar.firstElementChild)?.focus();
}
async function loadAlbums() {
 const data = await req('/albums');
 state.albums = data.albums || [];
 if (state.album !== 'all' && state.album !== 'unfiled' && !state.albums.some(album => album.id === state.album)) state.album = 'all';
 albumsSelect();
}
function modelSelect(models) {
 const select = $('modelFilter');
 const available = new Set(models);
 if (state.model !== 'all') available.add(state.model);
 select.replaceChildren(new Option('모든 모델', 'all'));
 for (const model of available) select.add(new Option(model, model));
 select.value = state.model;
}
function buildParams(){const p=new URLSearchParams();p.set('limit',state.limit);p.set('offset',state.offset);p.set('sort',state.sort);p.set('album',state.album);p.set('model',state.model);
 if(state.search)p.set('terms',JSON.stringify(searchTokens(state.search)));return p.toString();}
async function refresh(append = false) {
 if (!append) state.offset = 0;
 const rid = ++state.requestId;
 const count = $('galleryCount'), grid = $('galleryGrid'), more = $('loadMore');
 state.loading = true;
 retryAppend = null;
 grid.setAttribute('aria-busy', 'true');
 text(count, '작품 불러오는 중…');
 more.setAttribute('aria-disabled', 'true');
 try {
  const data = await req('/gallery?' + buildParams());
  if (rid !== state.requestId) return;
  state.items = append ? [...state.items, ...data.items] : data.items;
  state.total = data.total;
  state.offset = data.offset + data.items.length;
  modelSelect(data.models || []);
  render(append ? data.items : state.items, append);
 } catch (error) {
  if (rid !== state.requestId) return;
  retryAppend = append;
  text(count, '전시 데이터 연결 실패');
  text($('resetGalleryFilters'), '다시 시도');
  if (!append) {
   state.items = [];
   grid.replaceChildren();
  }
  $('galleryEmpty').hidden = false;
  text($('emptyTitle'), '작품 목록을 불러오지 못했어요.');
  text($('emptyMessage'), error.message);
 } finally {
  if (rid === state.requestId) {
   state.loading = false;
   more.removeAttribute('aria-disabled');
   grid.removeAttribute('aria-busy');
  }
 }
}
function render(items = state.items, append = false) {
 const grid = $('galleryGrid'), fragment = document.createDocumentFragment();
 const focused = grid.contains(document.activeElement) && document.activeElement.dataset.artwork;
 const hadMoreFocus = document.activeElement === $('loadMore');
 let firstAdded;
 for (const [index, item] of items.entries()) {
  const card = node('article', 'pin');
  const button = node('button', 'gallery-open');
  button.type = 'button';
  button.dataset.artwork = item.id;
  button.setAttribute('aria-label', item.title + ' 보기');
  button.setAttribute('aria-haspopup', 'dialog');
  const img = node('img', 'pin-image');
  img.src = item.src;
  img.alt = '';
  img.loading = !append && index === 0 ? 'eager' : 'lazy';
  img.decoding = 'async';
  if (Number(item.width) > 0 && Number(item.height) > 0) {
   img.width = item.width;
   img.height = item.height;
  }
  button.append(img);
  button.addEventListener('click', () => openLightbox(item, button));
  firstAdded ||= button;
  card.append(button, node('h2', '', item.title));
  if (item.model) card.append(node('p', '', item.model));
  fragment.append(card);
 }
 if (append) grid.append(fragment);
 else grid.replaceChildren(fragment);

 const empty = state.items.length === 0;
 $('galleryEmpty').hidden = !empty;
 $('loadMore').hidden = state.offset >= state.total || empty;
 text($('galleryCount'), state.total + '개 작품');
 if (empty) {
  const filtered = state.search || state.album !== 'all' || state.model !== 'all';
  text($('resetGalleryFilters'), '전체 작품 보기');
  text($('emptyTitle'), filtered ? '조건에 맞는 작품이 없어요.' : '아직 공개된 작품이 없어요.');
  text($('emptyMessage'), filtered ? '검색어나 필터를 바꿔 보세요.' : '게시된 작품은 여기에 표시됩니다.');
 }
 if (!append && focused) {
  ([...grid.querySelectorAll('.gallery-open')].find(button => button.dataset.artwork === focused) || $('gallerySearch')).focus();
 } else if (append && hadMoreFocus) {
  (firstAdded || $('gallerySearch')).focus();
 }
}
function kv(label,value){const d=node('div','kv');d.append(node('span','',label),node('span','',value??'—'));return d}
function openLightbox(item, opener){state.selected=item;
 $('lightboxMedia').replaceChildren();const img=node('img');img.src=item.src;img.alt=item.title;$('lightboxMedia').append(img);
 text($('lightboxTitle'),item.title);
 $('lightboxDetails').parentElement.open = false;
 const details=$('lightboxDetails');details.replaceChildren(kv('모델',item.model),kv('Seed',item.seed),kv('Sampler',item.sampler),kv('Steps',item.steps),kv('CFG',item.cfg),kv('LoRA',item.loras),kv('크기',item.width&&item.height?item.width+' × '+item.height+' px':''),kv('프롬프트',item.prompt),kv('Negative',item.negative),kv('태그',item.tags?.join(', ')));
 if(state.authorized){$('lightboxEditTitle').value=item.title;$('lightboxTags').value=(item.tags||[]).join(', ');
  const sel=$('lightboxAlbums');sel.replaceChildren();for(const a of state.albums){const opt=node('option','',a.name);opt.value=a.id;opt.selected=item.albumIds?.includes(a.id)||false;sel.append(opt)}
 }
 const url = new URL(location.href);
 url.searchParams.set('art', item.id);
 history.replaceState(history.state, '', url);
 show('galleryLightbox', opener)
}
function closeArt() {
 close('galleryLightbox');
 const url = new URL(location.href);
 url.searchParams.delete('art');
 history.replaceState(history.state, '', url);
 state.selected = null;
}
async function adminLogin(e){e.preventDefault();const pass=$('adminPassword').value.trim();$('adminMessage').textContent='관리 권한을 확인하는 중…';
 try{state.secret=pass;await req('/admin/check',{auth:true});state.authorized=true;sessionStorage.setItem('urz-gallery-admin',pass);setAuthor(true);$('adminPassword').value='';close('adminModal');notify('작가 모드로 로그인했습니다. 이제 공개 작품을 게시할 수 있어요.');
 }catch(err){state.secret='';$('adminMessage').textContent=err.message;notify('인증 실패: '+err.message)}
}
function adminLogout(){state.secret='';state.authorized=false;sessionStorage.removeItem('urz-gallery-admin');setAuthor(false);$('adminLogin').focus();notify('작가 관리 모드를 종료했습니다.')}
async function upload(files){if(!state.authorized){show('adminModal');return}
 const valid=[...files].filter(f=>/^image\/(png|jpeg|webp|avif|gif)$/i.test(f.type));if(!valid.length){notify('PNG/JPEG/WebP/AVIF/GIF 파일을 선택해 주세요.');return}
 let ok=0,failed=0,duplicate=0;const prog=$('uploadProgress');
 for(const [i,file] of valid.entries()){
  text(prog,`${i+1}/${valid.length} · ${file.name} 메타데이터 확인·서버 게시 중…`);
  try{
   if(file.size>25*1024*1024)throw new Error('25MB 초과');
   let raw={};if(file.type==='image/png')raw=await parsePNG(file);else if(file.type==='image/jpeg')raw=await parseJPEG(file);else if(file.type==='image/webp')raw=await parseWebP(file);
   const meta=parseMeta(raw),dim=await dimensions(file);meta.width=meta.width||String(dim.width);meta.height=meta.height||String(dim.height);
   const form=new FormData();form.append('image',file,file.name);form.append('details',JSON.stringify({title:file.name.replace(/\.[^.]+$/,''),meta,tags:extractTags(meta),albumIds:$('uploadAlbum').value?[$('uploadAlbum').value]:[]}));
   await req('/gallery',{method:'POST',body:form});ok++;
  }catch(err){if(err.status===409){duplicate++;continue}failed++;console.error('upload:',err);notify(`${file.name}: ${err.message}`)}
 }
 text(prog,`완료: ${ok}개 게시 · ${duplicate}개 중복 · ${failed}개 실패`);
 if(ok){close('uploadModal');await loadAlbums();await refresh();notify(`🎨 ${ok}개 작품을 공개 갤러리에 게시했어요!`)}
}
async function saveDetail(){if(!state.authorized||!state.selected)return;const item=state.selected;
 const tags=$('lightboxTags').value.split(',').map(x=>x.trim()).filter(Boolean);
 const albumIds=[...$('lightboxAlbums').selectedOptions].map(x=>x.value);
 try{await req('/gallery/'+encodeURIComponent(item.id),{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({title:$('lightboxEditTitle').value,tags,albumIds})});closeArt();await loadAlbums();await refresh();notify('작품 정보를 저장했습니다. 방문자에게도 반영됩니다.')}
 catch(e){notify('저장 실패: '+e.message)}
}
async function deleteDetail(){if(!state.authorized||!state.selected)return;if(!confirm('이 작품을 공개 갤러리에서 영구 삭제할까요? (원본 R2 파일도 삭제됩니다)'))return;
 try{await req('/gallery/'+encodeURIComponent(state.selected.id),{method:'DELETE'});closeArt();await loadAlbums();await refresh();notify('작품을 삭제했습니다.')}
 catch(e){notify('삭제 실패: '+e.message)}
}
function albumManager(){const list=$('albumManagerList');list.replaceChildren();if(!state.albums.length){list.append(node('p','muted small','앨범이 없어요. 아래에서 첫 앨범을 만들어 보세요.'));return}
 for(const a of state.albums){const row=node('div','album-manager-row'),label=node('div');label.append(node('strong','',a.name),node('small','muted',(a.count||0)+'개 작품'));const btn=node('button','btn secondary small','삭제');btn.type='button';btn.addEventListener('click',async()=>{
 if(!confirm(`앨범 ‘${a.name}’을 삭제할까요? 작품은 유지됩니다.`))return;
 try{await req('/albums/'+a.id,{method:'DELETE'});await loadAlbums();await refresh();albumManager();notify('앨범을 삭제했습니다.')}
 catch(e){notify(e.message)}
 });row.append(label,btn);list.append(row)}
}
async function createAlbum(){const name=$('albumName').value.trim();if(!name)return;
 try{await req('/albums',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name})});$('albumName').value='';await loadAlbums();albumManager();notify('공개 앨범을 만들었어요.')}
 catch(e){notify('앨범 생성 실패: '+e.message)}
}
function on(id,event,fn){$(id).addEventListener(event,fn)}
let searchTimer;on('gallerySearch','input',e=>{state.search=e.target.value;clearTimeout(searchTimer);searchTimer=setTimeout(()=>refresh(),260)});
on('modelFilter','change',e=>{state.model=e.target.value;refresh()});on('sortFilter','change',e=>{state.sort=e.target.value;refresh()});
on('allArtworks','click',()=>{clearTimeout(searchTimer);state.search='';state.album='all';state.model='all';$('gallerySearch').value='';$('modelFilter').value='all';syncAlbumButtons();refresh()});
on('resetGalleryFilters','click', () => {
 $('allArtworks').focus();
 if (retryAppend !== null) refresh(retryAppend);
 else $('allArtworks').click();
});
on('albumBar', 'click', event => {
 const button = event.target.closest('[data-album]');
 if (!button || state.album === button.dataset.album) return;
 state.album = button.dataset.album;
 syncAlbumButtons();
 refresh();
});
on('loadMore','click',()=>{if(!state.loading)refresh(true)});
on('adminLogin','click',()=>show('adminModal'));on('adminLogout','click',adminLogout);on('adminForm','submit',adminLogin);
on('openUpload','click',()=>{albumsSelect();show('uploadModal')});on('browseFiles','click',()=>$('uploadInput').click());
on('uploadInput','change',e=>{upload(e.target.files);e.target.value=''});
on('manageAlbums','click',()=>{albumManager();show('albumModal')});on('createAlbum','click',createAlbum);
on('closeLightbox','click',closeArt);on('shareArtwork','click',async()=>{const url=location.origin+location.pathname+'?art='+encodeURIComponent(state.selected.id);try{await navigator.clipboard.writeText(url);notify('작품 주소를 복사했어요.')}catch{prompt('작품 주소 복사',url)}});
on('saveArtwork','click',saveDetail);on('deleteArtwork','click',deleteDetail);
for (const [id, dismiss] of [
 ['adminModal', () => close('adminModal')],
 ['uploadModal', () => close('uploadModal')],
 ['albumModal', () => close('albumModal')],
 ['galleryLightbox', closeArt]
]) {
 const dialog = $(id);
 window.urzBackdrop(dialog, dismiss);
 dialog.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
}
for (const selector of ['[data-close-admin]', '[data-close-upload]', '[data-close-album]']) {
 const button = document.querySelector(selector);
 button.addEventListener('click', () => close(button.closest('dialog').id));
}
const drop=$('uploadDrop');drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('drag')});drop.addEventListener('dragleave',()=>drop.classList.remove('drag'));
drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('drag');if(e.dataTransfer.files?.length)upload(e.dataTransfer.files)});
async function init() {
 setAuthor(false);
 if (state.secret) {
  try { await req('/admin/check', {auth:true}); setAuthor(true); }
  catch { state.secret = ''; sessionStorage.removeItem('urz-gallery-admin'); }
 }
 try { await loadAlbums(); }
 catch { /* The list request reports service availability separately. */ }
 await refresh();
 const artwork = new URLSearchParams(location.search).get('art');
 if (!artwork) return;
 const listedItem = state.items.find(item => item.id === artwork);
 if (listedItem) {
  openLightbox(listedItem);
  return;
 }
 try {
  const {item} = await req('/gallery?id=' + encodeURIComponent(artwork));
  if (item) openLightbox(item);
 } catch (error) {
  if (error.status === 404) notify('해당 작품을 찾을 수 없어요.');
 }
}
await init();
})();
