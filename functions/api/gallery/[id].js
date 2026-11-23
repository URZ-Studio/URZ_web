import {json,fail,configured,missing,ensureSchema,authorized,mustBeAdminError,safeTags,metaFields,searchText,albumIds,clean,withAlbums} from '../../../lib/gallery_shared.js';
export async function onRequestPatch(context){
 if(!configured(context.env))return missing();
 if(!await authorized(context))return mustBeAdminError(context);
 const id=context.params.id,db=context.env.GALLERY_DB;try{
  await ensureSchema(db);
  const old=await db.prepare('SELECT * FROM artworks WHERE id=?').bind(id).first();if(!old)return fail(404,'작품이 없어요.');
  const data=await context.request.json();if(!data||typeof data!=='object')return fail(400,'잘못된 작품 정보입니다.');
  const meta=metaFields({...old,...data.meta}),title=clean(data.title??old.title,160)||'Untitled';
  const tags=safeTags(data.tags??JSON.parse(old.tags_json));
  await db.prepare(`UPDATE artworks SET title=?,prompt=?,negative=?,model=?,seed=?,steps=?,cfg=?,sampler=?,loras=?,tags_json=?,search_text=? WHERE id=?`)
   .bind(title,meta.prompt,meta.negative,meta.model,meta.seed,meta.steps,meta.cfg,meta.sampler,meta.loras,JSON.stringify(tags),searchText(title,old.filename,meta,tags),id).run();
  if('albumIds' in data){await db.prepare('DELETE FROM artwork_albums WHERE artwork_id=?').bind(id).run();for(const aid of albumIds(data.albumIds))await db.prepare('INSERT OR IGNORE INTO artwork_albums(artwork_id,album_id) SELECT ?,id FROM albums WHERE id=?').bind(id,aid).run()}
  const updated=await db.prepare('SELECT * FROM artworks WHERE id=?').bind(id).first();return json({item:(await withAlbums(db,[updated]))[0]});
 }catch(e){console.error('gallery edit',e);return fail(500,'수정할 수 없어요.')}
}
export async function onRequestDelete(context){
 if(!configured(context.env))return missing();
 if(!await authorized(context))return mustBeAdminError(context);
 const db=context.env.GALLERY_DB,id=context.params.id;try{
 await ensureSchema(db);
 const old=await db.prepare('SELECT object_key FROM artworks WHERE id=?').bind(id).first();if(!old)return fail(404,'이미 삭제된 작품입니다.');
 await db.prepare('DELETE FROM artwork_albums WHERE artwork_id=?').bind(id).run();
 await db.prepare('DELETE FROM artworks WHERE id=?').bind(id).run();
 await context.env.GALLERY_IMAGES.delete(old.object_key);
 return json({ok:true});
 }catch(e){console.error('gallery remove',e);return fail(500,'삭제에 실패했어요.')}
}
