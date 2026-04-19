// sample spacetime Schedule test.

// https://spacetimedb.com/docs/tables/event-tables/
// 
// 
// 
// 

import { DbConnection, tables } from './module_bindings';
import { Identity } from 'spacetimedb';
import van from "https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-1.6.0.min.js"

const HOST = 'ws://localhost:3000';
const DB_NAME = 'spacetime-app-map';
const {div, button, label, input, li, ul} = van.tags;

var identity_client = null;
var identity_raw = null;

const conn = DbConnection.builder()
  .withUri(HOST)
  .withDatabaseName(DB_NAME)
  .withToken(localStorage.getItem('auth_token') || undefined)
  .onConnect((conn, identity, token) => {
    console.log(conn);
    localStorage.setItem('auth_token', token);
    console.log("identity:", identity)
    console.log('Connected with identity:', identity.toHexString());
    identity_client =  identity.toHexString()
    identity_raw =  identity;

    // event table listen
    conn
      .subscriptionBuilder()
      .subscribe(tables.damageEvent);

    conn.db.damageEvent.onInsert((ctx, event) => {
      console.log(`Entity ${event.entityId} took ${event.damage} damage from ${event.source}`);
      console.log("sss EVENT....");
      // console.log(`Entity took ${event.damage} damage from ${event.source}`);
    });

    
  })
  .onDisconnect(() => {
    console.log('Disconnected from SpacetimeDB');
  })
  .onConnectError((_ctx, error) => {
    console.error('Connection error:', error);
  })
  .build();

console.log("conn.reducers");
console.log(conn.reducers);

function App(){

  const text_content = van.state('');
  // const isDone = van.state(false);
  const isDone = van.state(true);

    function test(){
        console.log("test");
        console.log(conn.reducers);
        // conn.reducers.sayHello();
    }

    function testSchedule(){
        console.log("test Schedule");
        conn.reducers.scheduleTimedTasks();
        // conn.reducers.send
    }

    function testEvent(){
        console.log("test Event");
        // console.log("conn.identity: ", conn.identity);
        // console.log("conn.Identity: ", conn.Identity);
        // console.log("conn.sender: ", conn.sender);
        // console.log("conn.connectionId: ", conn.connectionId);
        // console.log(identity_client)
        // console.log(identity_raw)

        // console.log(identity_raw.toHexString())

        // const target = Identity.fromHexString(conn.identity.toHexString());
        // const target = Identity.fromHexString(identity_raw.toHexString());
        // const target = identity_raw.toHexString();
        const target = identity_raw;
        console.log("target: ",target);
        console.log("type: ", typeof target);

        // conn.reducers.attack({target_id:identity_client, damage:10});
        // conn.reducers.attack({target_id:identity_raw, damage:10});
        conn.reducers.attack({
          // target_id: { __identity__: identity_raw.toHexString()}
          // target_id: identity_raw
          // target_id: conn.Identity,
          // target_id: target,
          damage:10
      });
    }

    return div(
        button({onclick:()=>test()},"test"),
        button({onclick:()=>testSchedule()},"testSchedule"),
        button({onclick:()=>testEvent()},"testEvent"),
    )
}

van.add(document.body, App());
