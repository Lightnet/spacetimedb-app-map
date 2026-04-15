//-----------------------------------------------
// 
//-----------------------------------------------
import { t, SenderError  } from 'spacetimedb/server';
import spacetimedb from '../module';
//-----------------------------------------------
// GET IMAGE
//-----------------------------------------------
// testing get image
export const get_image = spacetimedb.procedure(
  { id:t.string() }, 
  // t.object('Name', { data: t.array(t.u8()),type:t.string()  }),
  // t.object('AvatarResult', { 
  t.object('Name', { //return data if exist
    data: t.option(t.array(t.u8())), 
    type: t.string() 
  }),
  (ctx,{id})=>{
    // let data=null;
    // let type=null;
    // let file = ctx.withTx(ctx => {
    return ctx.withTx(ctx => {
      const user_avatar = ctx.db.image.id.find(id);
      // console.log("user id exist:", user_avatar?.userId);
      if(user_avatar){
        // data = user_avatar.data;
        // type = user_avatar.mimeType;
        return { 
            data: user_avatar.data ?? undefined, 
            type: user_avatar.mimeType ?? "" 
        };
      }
      return { data: undefined, type: "" };
  });
//   if(file){
//     return {data:file?.data, type:file?.type};
//   }else{
//     return { data: undefined, type: "" };
//   }
})

