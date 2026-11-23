import {fail,configured,missing} from '../../../../lib/gallery_shared.js';
export async function onRequestGet(context){
 if(!configured(context.env))return missing();
 const id=context.params.id;
 if(!/^[0-9a-f-]{36}$/i.test(id))return fail(404,'이미지를 찾을 수 없어요.');
 try{
  const record=await context.env.GALLERY_DB.prepare('SELECT object_key,mime FROM artworks WHERE id=?').bind(id).first();
  if(!record)return fail(404,'작품을 찾을 수 없어요.');
  const object=await context.env.GALLERY_IMAGES.get(record.object_key);
  if(!object)return fail(404,'원본 이미지가 아직 저장소에 없어요.');
  return new Response(object.body,{headers:{'content-type':record.mime,'cache-control':'public, max-age=3600','x-content-type-options':'nosniff','content-disposition':'inline'}});
 }catch(e){console.error('gallery image',e);return fail(500,'이미지 파일을 읽을 수 없어요.')}
}
