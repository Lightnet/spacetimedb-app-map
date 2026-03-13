import { DbConnection, tables } from './module_bindings';
import { Identity } from 'spacetimedb';
import van from "https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-1.6.0.min.js"
import { Value } from 'three/examples/jsm/inspector/ui/Values.js';

const HOST = 'ws://localhost:3000';
const DB_NAME = 'spacetime-app-map';

const {div, button, label, input, li, ul} = van.tags;


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

const task_list = div();

function task_info(item){
  const text_content = van.state(item.text);

  function update_task(){
    console.log("text_content.val: ", text_content.val);


    conn.reducers.updateTask({
      id:item.id,
      text:text_content.val,
      isDone:item.isDone
    });
  }

  function delete_task(id){
    conn.reducers.deleteTask({id});
  }

  return li(
    input({value:text_content.val, oninput:e=>text_content.val=e.target.value}, item.text),
    button({onclick:()=>update_task()}, 'Update'),
    button({onclick:()=>delete_task(item.id)}, 'Delete')
  )
}

function getTaskList(conn){
  // console.log(conn);
  const tasks = Array.from(conn.db.task.iter());
  console.log(tasks.length);

  if (tasks.length === 0) {
    console.log('task empty...');
    return;
  }

  task_list.replaceChildren(); 

  console.log("tasks");
  console.log(tasks)

  let pp = tasks
    .map((p) => {
      // console.log(p)
      // return '<li>' + (p.id || '') + '</li>'
      // return li({id:p.id}, p.text)
      return task_info(p)
    });
  // console.log(pp);
  van.add(task_list, ul(pp));

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
    // conn
    //   .subscriptionBuilder()
    //   .onApplied(() => getPersonList(conn))
    //   .subscribe(tables.person);

    // conn.db.person.onInsert(() => renderPeople(conn));
    // conn.db.person.onDelete(() => renderPeople(conn));

    conn
      .subscriptionBuilder()
      .onApplied(() => getTaskList(conn))
      .subscribe(tables.task);
    conn.db.task.onInsert(() => getTaskList(conn));
    conn.db.task.onDelete(() => getTaskList(conn));
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
// console.log("vanjs test");

function App(){

  const text_content = van.state('');
  // const isDone = van.state(false);
  const isDone = van.state(true);

    function test(){
        console.log("test");
        console.log(conn.reducers);
        // conn.reducers.sayHello();
    }

    function testHello(){
        console.log("test");
        console.log(conn.reducers);
        conn.reducers.sayHello();
    }

    function addTask(){
        console.log("add task");
        console.log(conn.reducers);

        console.log("TASK: ",text_content.val)
        console.log("IS DONE: ",isDone.val)

        // conn.reducers.addTask("test",false);
        conn.reducers.addTask({
          text:text_content.val,
          isDone:isDone.val
        });
    }

    function deleteTask(){
        console.log("add");
        console.log(conn.reducers);
        // conn.reducers.deleteTask({text:text_content.val});
        // conn.reducers.deleteTask({id:3n});

        const tasks = Array.from(conn.db.task.iter());

        console.log("tasks: ",tasks.length);

        for(const task of tasks){
          console.log(task);
          console.log(typeof task.id);
          if(task.text == text_content.val){
            conn.reducers.deleteTask({id:task.id});
            break;
          }
        }
    }

    function personList(){
        console.log("personList");
        // console.log(conn.reducers);
        console.log(conn.db);
        getPersonList(conn);
    }

    return div(
        button({onclick:()=>test()},"test"),
        button({onclick:()=>testHello()},"hello"),
        button({onclick:()=>addTask()},"Add"),
        button({onclick:()=>deleteTask()},"Delete"),
        input({value:text_content,oninput:(e)=>text_content.val=e.target.value}),

        task_list
        // button({onclick:()=>add2()},"Add2"),
        // button({onclick:()=>personList()},"Person List"),
    )
}

van.add(document.body, App());


