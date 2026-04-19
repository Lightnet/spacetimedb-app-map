import { DbConnection, tables } from './module_bindings';
import { Identity } from 'spacetimedb';
import van from "https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-1.6.0.min.js"

const HOST = 'ws://localhost:3000';
const DB_NAME = 'spacetime-app-map';

const {div, button, label} = van.tags;


function getPersonList(conn){
  // console.log(conn);
  const people = Array.from(conn.db.person.iter());
  console.log(people.length);

  if (people.length === 0) {
    console.log('person empty...');
    return;
  }

  let pp = people
    .map((p) => {
      console.log(p)
      return '<li>' + (p.name || '') + '</li>'
    })
    .join('');
  console.log(pp);


}



const conn = DbConnection.builder()
  .withUri(HOST)
  .withDatabaseName(DB_NAME)
  .withToken(localStorage.getItem('auth_token') || undefined)
  .onConnect((conn, identity, token) => {
    localStorage.setItem('auth_token', token);
    console.log('Connected with identity:', identity.toHexString());

    // statusEl.textContent = 'Connected';
    // statusEl.style.color = 'green';
    // nameInput.disabled = false;
    // addBtn.disabled = false;

    // register table person to query data.
    conn
      .subscriptionBuilder()
      .onApplied(() => getPersonList(conn))
      .subscribe(tables.person);

    // conn.db.person.onInsert(() => renderPeople(conn));
    // conn.db.person.onDelete(() => renderPeople(conn));
  })
  .onDisconnect(() => {
    console.log('Disconnected from SpacetimeDB');
    // statusEl.textContent = 'Disconnected';
    // statusEl.style.color = 'red';
    // nameInput.disabled = true;
    // addBtn.disabled = true;
  })
  .onConnectError((_ctx, error) => {
    console.error('Connection error:', error);
    // statusEl.textContent = 'Error: ' + error.message;
    // statusEl.style.color = 'red';
  })
  .build();

console.log("conn.reducers");
console.log(conn.reducers);

console.log("vanjs test");



function App(){

    function test(){
        console.log("test");
        console.log(conn.reducers);
        conn.reducers.sayHello();
    }

    function add(){
        console.log("add");
        console.log(conn.reducers);
        conn.reducers.add("test");
    }

    function add2(){
        console.log("add");
        console.log(conn.reducers);
        conn.reducers.add("test");
    }

    function personList(){
        console.log("personList");
        // console.log(conn.reducers);
        console.log(conn.db);
        getPersonList(conn);
    }

    return div(
        button({onclick:()=>test()},"test"),
        button({onclick:()=>add()},"Add"),
        button({onclick:()=>add2()},"Add2"),
        button({onclick:()=>personList()},"Person List"),
    )
}

van.add(document.body, App());