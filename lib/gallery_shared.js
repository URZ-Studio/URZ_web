/** Shared Cloudflare Pages Functions utilities for the public portfolio gallery. */
const HEADERS = {'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
export function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:HEADERS});}
export function fail(status,message){return json({error:message},status);}
export function configured(env){return !!(env?.GALLERY_DB && env?.GALLERY_IMAGES);}
export function missing(){return fail(503,'갤러리 서버 설정이 아직 완료되지 않았습니다. Cloudflare의 D1(GALLERY_DB), R2(GALLERY_IMAGES) 바인딩을 확인해 주세요.');}
export async function ensureSchema(db){
  // Safe to call after first deploy: schema is self-initializing and does not delete existing data.
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS albums (id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, created_at INTEGER NOT NULL)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS artworks (
      id TEXT PRIMARY KEY, object_key TEXT NOT NULL UNIQUE, sha256 TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL, filename TEXT NOT NULL, mime TEXT NOT NULL, size INTEGER NOT NULL,
      width INTEGER NOT NULL DEFAULT 0, height INTEGER NOT NULL DEFAULT 0,
      prompt TEXT NOT NULL DEFAULT '', negative TEXT NOT NULL DEFAULT '', model TEXT NOT NULL DEFAULT '',
      seed TEXT NOT NULL DEFAULT '', steps TEXT NOT NULL DEFAULT '', cfg TEXT NOT NULL DEFAULT '',
      sampler TEXT NOT NULL DEFAULT '', loras TEXT NOT NULL DEFAULT '',
      tags_json TEXT NOT NULL DEFAULT '[]', search_text TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS artwork_albums (artwork_id TEXT NOT NULL, album_id TEXT NOT NULL,
      PRIMARY KEY (artwork_id, album_id), FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
      FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE)`),
    db.prepare('CREATE INDEX IF NOT EXISTS ix_artworks_created ON artworks(created_at DESC, id DESC)'),
    db.prepare('CREATE INDEX IF NOT EXISTS ix_artworks_model ON artworks(model)'),
    db.prepare('CREATE INDEX IF NOT EXISTS ix_work_album ON artwork_albums(album_id, artwork_id)')
  ]);
}
export const clean=(v,n=160)=>String(v??'').trim().slice(0,n);
export const norm=(v)=>String(v??'').normalize('NFKC').toLowerCase();
export function readable(row, albumIds=[]){return {
  id:row.id,title:row.title,filename:row.filename,model:row.model,seed:row.seed,
  prompt:row.prompt,negative:row.negative,steps:row.steps,cfg:row.cfg,sampler:row.sampler,loras:row.loras,
  tags:JSON.parse(row.tags_json||'[]'),albumIds,width:row.width,height:row.height,
  createdAt:row.created_at,size:row.size,src:'/api/gallery/image/'+encodeURIComponent(row.id)
};}
export function safeTags(v){return (Array.isArray(v)?v:[]).filter(x=>typeof x==='string').slice(0,40).map(x=>clean(x,60)).filter(Boolean);}
export function metaFields(m){m=m&&typeof m==='object'&&!Array.isArray(m)?m:{};return {
  prompt:clean(m.prompt,20000),negative:clean(m.negative,16000),model:clean(m.model,300),
  seed:clean(m.seed,100),steps:clean(m.steps,30),cfg:clean(m.cfg,30),sampler:clean(m.sampler,160),
  loras:clean(m.loras,3000),width:Math.max(0,Math.min(200000,Number(m.width)||0)),
  height:Math.max(0,Math.min(200000,Number(m.height)||0))
};}
export function searchText(title,filename,meta,tags){return norm([title,filename,meta.prompt,meta.negative,meta.model,meta.seed,meta.steps,meta.cfg,meta.sampler,meta.loras,...tags].join(' ')).slice(0,50000);}
export function albumIds(x){return [...new Set((Array.isArray(x)?x:[]).filter(v=>typeof v==='string'&&/^[0-9a-f-]{36}$/i.test(v)))].slice(0,30);}
const hex=bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
export async function sha256(input){return hex(await crypto.subtle.digest('SHA-256',input));}
export async function authorized(context){
 const secret=context.env?.ADMIN_UPLOAD_KEY;
 if(typeof secret!=='string'||secret.length<24)return false;
 const header=context.request.headers.get('authorization')||'';
 if(!header.startsWith('Bearer '))return false;
 const token=header.slice(7);if(token.length<24||token.length>300)return false;
 const enc=new TextEncoder();const [a,b]=await Promise.all([sha256(enc.encode(secret)),sha256(enc.encode(token))]);
 let diff=0;for(let i=0;i<a.length;i++)diff |= a.charCodeAt(i)^b.charCodeAt(i);return diff===0;
}
export function allowedOrigin(request){const h=request.headers.get('origin');return !h||h===new URL(request.url).origin;}
export function mustBeAdminError(context){
 if(!allowedOrigin(context.request))return fail(403,'허용되지 않은 요청 출처입니다.');
 if(!context.env?.ADMIN_UPLOAD_KEY || String(context.env.ADMIN_UPLOAD_KEY).length<24)return fail(503,'Cloudflare에 ADMIN_UPLOAD_KEY 암호를 24자 이상으로 등록해 주세요.');
 return fail(401,'작가 인증이 필요하거나 관리 암호가 올바르지 않습니다.');
}
export function likeTerm(x){return '%'+norm(x).replace(/[\\%_]/g,'\\$&')+'%';}
export async function withAlbums(db,rows){
 if(!rows.length)return [];
 const ids=rows.map(x=>x.id);
 const assoc=await db.prepare(`SELECT artwork_id,album_id FROM artwork_albums WHERE artwork_id IN (${ids.map(()=>'?').join(',')})`).bind(...ids).all();
 const group=new Map();for(const item of assoc.results||[]){const a=group.get(item.artwork_id)||[];a.push(item.album_id);group.set(item.artwork_id,a)}
 return rows.map(row=>readable(row,group.get(row.id)||[]));
}
export function checkType(type,first){
 const u=new Uint8Array(first);
 if(type==='image/png')return u.length>=8&&[137,80,78,71,13,10,26,10].every((x,i)=>u[i]===x);
 if(type==='image/jpeg')return u[0]===255&&u[1]===216&&u[2]===255;
 if(type==='image/gif')return u[0]===71&&u[1]===73&&u[2]===70&&u[3]===56;
 if(type==='image/webp')return u[0]===82&&u[1]===73&&u[2]===70&&u[3]===70&&u[8]===87&&u[9]===69&&u[10]===66&&u[11]===80;
 if(type==='image/avif')return u[4]===102&&u[5]===116&&u[6]===121&&u[7]===112&&new TextDecoder().decode(u.slice(8,32)).includes('avif');
 return false;
}
export function extension(mime){return ({'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/avif':'avif','image/gif':'gif'})[mime]||'bin';}
