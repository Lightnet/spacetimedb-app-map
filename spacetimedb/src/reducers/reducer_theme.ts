// ----------------------------------------------
// REDUCERS THEME
// ----------------------------------------------
import { schema, table, t, SenderError  } from 'spacetimedb/server';
import spacetimedb from '../module';
// ----------------------------------------------
// 
// ----------------------------------------------
export const set_theme = spacetimedb.reducer(
  { name: t.string() }, 
  (ctx, { name }) => {
    //
    

  }
);
// ----------------------------------------------
// 
// ----------------------------------------------
export const toggle_theme = spacetimedb.reducer({}, (ctx, {}) => {
  //
    

});
// ----------------------------------------------
// 
// ----------------------------------------------
export const set_theme_name = spacetimedb.reducer(
  { name: t.string() }, 
  (ctx, { name }) => {
    //
    

  }
);