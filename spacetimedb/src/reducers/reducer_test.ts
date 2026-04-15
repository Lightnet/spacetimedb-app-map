// ----------------------------------------------
// REDUCERS TEST
// ----------------------------------------------
import * as DBSERVER from 'spacetimedb/server';
// missing range function
import { schema, table, t, SenderError  } from 'spacetimedb/server';
import spacetimedb from '../module';
// ----------------------------------------------
// 
// ----------------------------------------------
function getAllMethods(obj:any) {
    return Object.getOwnPropertyNames(obj).filter(prop => {
        return typeof obj[prop] === 'function';
    });
}
// ----------------------------------------------
// 
// ----------------------------------------------
export const call_test = spacetimedb.reducer(
    { text: t.string() }, 
    (ctx, { text }) => {
  console.info(`User ${ctx.sender}: ${text}`);
  console.log(getAllMethods(DBSERVER));

  // let test = new Range({ tag: 'included', value: 1n }, { tag: 'unbounded' });
  // let test = new range({ tag: 'included', value: 1n }, { tag: 'unbounded' });
  // console.log(test);
  
  // ctx.db.message.insert({
  //   sender: ctx.sender,
  //   text,
  //   sent: ctx.timestamp,
  // });
});