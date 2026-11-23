import {json,fail,configured,missing,ensureSchema,authorized,mustBeAdminError,clean} from '../../lib/gallery_shared.js';
export async function onRequestGet(context){
 if(!configured(context.env))return missing();try{const db=context.env.GALLERY_DB;await ensureSchema(db);
  const r=await db.prepare(`SELECT a.id,a.name,a.created_at AS createdAt,COUNT(j.artwork_id) AS count FROM albums a LEFT JOIN artwork_albums j ON a.id=j.album_id GROUP BY a.id ORDER BY a.created_at DESC`).all();
  return json({albums:r.results||[]});
 }catch(e){console.error('albums',e);return fail(500,'앨범 목록을 읽을 수 없어요.')}
}
export async function onRequestPost(context){
 if(!configured(context.env))return missing();if(!await authorized(context))return mustBeAdminError(context);
 try{const data=await context.request.json(),name=clean(data.name,70);if(!name)return fail(400,'앨범 이름을 입력해 주세요.');
 const id=crypto.randomUUID(),createdAt=Date.now(),db=context.env.GALLERY_DB;await ensureSchema(db);
 await db.prepare('INSERT INTO albums(id,name,created_at) VALUES(?,?,?)').bind(id,name,createdAt).run();return json({album:{id,name,createdAt,count:0}},201);
 }catch(e){if(/UNIQUE/.test(String(e)))return fail(409,'이미 같은 이름의 앨범이 있어요.');console.error(e);return fail(500,'앨범 생성 실패')}
}
