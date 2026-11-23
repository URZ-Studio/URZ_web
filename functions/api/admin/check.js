import {json,fail,authorized} from '../../../lib/gallery_shared.js';
export async function onRequestGet(context){
 if(!context.env?.ADMIN_UPLOAD_KEY||String(context.env.ADMIN_UPLOAD_KEY).length<24)return fail(503,'ADMIN_UPLOAD_KEY를 Cloudflare 비밀 변수로 설정해 주세요.');
 if(!await authorized(context))return fail(401,'관리 암호가 올바르지 않습니다.');
 return json({ok:true});
}
