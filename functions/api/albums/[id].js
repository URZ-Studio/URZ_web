import {json,fail,configured,missing,ensureSchema,authorized,mustBeAdminError} from '../../../lib/gallery_shared.js';
export async function onRequestDelete(context){
 if(!configured(context.env))return missing();if(!await authorized(context))return mustBeAdminError(context);
 try{const db=context.env.GALLERY_DB;await ensureSchema(db);await db.prepare('DELETE FROM artwork_albums WHERE album_id=?').bind(context.params.id).run();
 await db.prepare('DELETE FROM albums WHERE id=?').bind(context.params.id).run();return json({ok:true});
 }catch(e){console.error(e);return fail(500,'앨범을 삭제할 수 없어요.')}
}
