import {json,fail,configured,missing,ensureSchema,authorized,mustBeAdminError,likeTerm,withAlbums,metaFields,safeTags,searchText,albumIds,checkType,extension,sha256,clean} from '../../lib/gallery_shared.js';
export async function onRequestGet(context){
 const db=context.env?.GALLERY_DB;
 if(!configured(context.env))return missing();
 try{
  await ensureSchema(db);
  const url=new URL(context.request.url),limit=Math.max(1,Math.min(60,Number(url.searchParams.get('limit'))||36));
  // Direct links: /gallery.html?art=ID look up any published item, not only the first page.
  const single=url.searchParams.get('id');
  if(single){
   if(!/^[0-9a-f-]{36}$/i.test(single))return fail(404,'해당 작품이 없어요.');
   const row=await db.prepare('SELECT * FROM artworks WHERE id=?').bind(single).first();
   if(!row)return fail(404,'해당 작품이 없어요.');
   return json({item:(await withAlbums(db,[row]))[0]});
  }
  const offset=Math.max(0,Math.min(100000,Number(url.searchParams.get('offset'))||0));
  const where=[],values=[];
  const album=url.searchParams.get('album')||'all';
  if(album==='unfiled')where.push('NOT EXISTS(SELECT 1 FROM artwork_albums j WHERE j.artwork_id=a.id)');
  else if(album!=='all' && /^[0-9a-f-]{36}$/i.test(album)){where.push('EXISTS(SELECT 1 FROM artwork_albums j WHERE j.artwork_id=a.id AND j.album_id=?)');values.push(album)}
  const model=url.searchParams.get('model');if(model&&model!=='all'){where.push('a.model=?');values.push(clean(model,300))}
  // Each query word must match one of its translated search aliases, and all groups must match.
  let groups=[];
  try{groups=JSON.parse(url.searchParams.get('terms')||'[]')}catch{}
  if(!Array.isArray(groups))groups=[];
  for(const group of groups.slice(0,10)){
   const terms=[...new Set((Array.isArray(group)?group:[]).filter(x=>typeof x==='string').map(x=>x.trim()).filter(x=>x.length>=1&&x.length<=60))].slice(0,7);
   if(!terms.length)continue;
   where.push('('+terms.map(()=>`a.search_text LIKE ? ESCAPE '\\'`).join(' OR ')+')');
   for(const term of terms)values.push(likeTerm(term));
  }
  const filter=where.length?' WHERE '+where.join(' AND '):'';
  const sorting={newest:'a.created_at DESC,a.id DESC',oldest:'a.created_at ASC,a.id ASC',title:'a.title COLLATE NOCASE ASC,a.id ASC'};
  const order=sorting[url.searchParams.get('sort')]||sorting.newest;
  const [list,count,models]=await Promise.all([
   db.prepare(`SELECT a.* FROM artworks a${filter} ORDER BY ${order} LIMIT ? OFFSET ?`).bind(...values,limit,offset).all(),
   db.prepare(`SELECT COUNT(*) AS n FROM artworks a${filter}`).bind(...values).first(),
   db.prepare('SELECT DISTINCT model FROM artworks WHERE model<>\'\' ORDER BY model LIMIT 150').all()
  ]);
  return json({items:await withAlbums(db,list.results||[]),total:count?.n||0,offset,limit,models:(models.results||[]).map(x=>x.model)});
 }catch(e){console.error('gallery list',e);return fail(500,'갤러리 조회 오류가 발생했어요. Cloudflare Functions 로그를 확인해 주세요.')}
}
export async function onRequestPost(context){
 if(!configured(context.env))return missing();
 if(!await authorized(context))return mustBeAdminError(context);
 const len=Number(context.request.headers.get('content-length')||0);if(len>28*1024*1024)return fail(413,'파일은 25MB 이하만 업로드할 수 있어요.');
 try{
  const form=await context.request.formData(),file=form.get('image');
  if(!file||typeof file.arrayBuffer!=='function')return fail(400,'이미지 파일이 없어요.');
  if(file.size<1||file.size>25*1024*1024)return fail(413,'파일은 25MB 이하만 업로드할 수 있어요.');
  if(!['image/png','image/jpeg','image/webp','image/avif','image/gif'].includes(file.type))return fail(415,'PNG/JPEG/WebP/AVIF/GIF 파일만 지원해요.');
  const bytes=await file.arrayBuffer();if(!checkType(file.type,bytes.slice(0,32)))return fail(415,'이미지 확장자와 실제 파일 형식이 맞지 않습니다.');
  const hash=await sha256(bytes),db=context.env.GALLERY_DB;
  await ensureSchema(db);
  const existing=await db.prepare('SELECT id FROM artworks WHERE sha256=?').bind(hash).first();
  if(existing)return json({error:'이미 등록한 이미지입니다.',existingId:existing.id},409);
  let body={};try{body=JSON.parse(String(form.get('details')||'{}'))}catch{return fail(400,'작품 정보 JSON 형식이 올바르지 않아요.')}
  const meta=metaFields(body.meta),tags=safeTags(body.tags),name=clean(body.title||file.name.replace(/\.[^.]+$/,''),160)||'Untitled';
  const id=crypto.randomUUID(),key='artworks/'+id+'.'+extension(file.type),albumList=albumIds(body.albumIds);
  const now=Date.now();
  await context.env.GALLERY_IMAGES.put(key,bytes,{httpMetadata:{contentType:file.type,cacheControl:'public, max-age=86400'},customMetadata:{originalFilename:clean(file.name,180)}});
  try{
   await db.prepare(`INSERT INTO artworks(id,object_key,sha256,title,filename,mime,size,width,height,prompt,negative,model,seed,steps,cfg,sampler,loras,tags_json,search_text,created_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,key,hash,name,clean(file.name,180),file.type,file.size,meta.width,meta.height,meta.prompt,meta.negative,meta.model,meta.seed,meta.steps,meta.cfg,meta.sampler,meta.loras,JSON.stringify(tags),searchText(name,file.name,meta,tags),now).run();
   for(const albumId of albumList){await db.prepare('INSERT OR IGNORE INTO artwork_albums(artwork_id,album_id) SELECT ?,id FROM albums WHERE id=?').bind(id,albumId).run()}
  }catch(e){await context.env.GALLERY_IMAGES.delete(key);if(/UNIQUE/.test(String(e)))return fail(409,'이미 등록한 이미지입니다.');throw e}
  return json({ok:true,id},201);
 }catch(e){console.error('gallery upload',e);return fail(500,'이미지 게시 중 서버 오류가 발생했어요.')}
}
