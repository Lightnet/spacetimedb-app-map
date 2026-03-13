// server api

import { ScheduleAt } from 'spacetimedb';
import { schema, table, t, SenderError  } from 'spacetimedb/server';

const foo = table(
  { public: true },
  {
    name: t.string(),
  }
);

const test = table(
  { public: true },
  {
    id: t.u32().primaryKey().autoInc(),
    name: t.string(),
  }
);

const person = table(
  { public: true },
  {
    name: t.string(),
  }
);

const user = table(
  { name: 'user', public: true },
  {
    identity: t.identity().primaryKey(),
    name: t.string().optional(),
    online: t.bool(),
  }
);

const message = table(
  { name: 'message', public: true },
  {
    sender: t.identity(),
    sent: t.timestamp(),
    text: t.string(),
  }
);


// spacetime sql --server local spacetime-app-map "DROP TABLE task" // nope
// spacetime delete <DATABASE_NAME>
// spacetime delete spacetime-app-map
// spacetime delete spacetime-app-map --server local

const task = table(
  { name: 'task', public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    // sender: t.identity(),
    // date: t.timestamp(),
    text: t.string(),
    isDone: t.bool().default(false),
    // isDone: t.bool().optional().default(false),
  }
);

const reminder = table(
  { name: 'reminder', scheduled: (): any => send_reminder, public: true },
  {
    scheduled_id: t.u64().primaryKey().autoInc(),
    scheduled_at: t.scheduleAt(),
    message: t.string(),
  }
);

const damageEvent = table({
  public: true,
  event: true,
}, {
  entity_id: t.identity(),
  damage: t.u32(),
  source: t.string(),
});

const spacetimedb = schema({
  test,
  foo,
  person,
  user,
  message,
  task,
  reminder,
  damageEvent
});

export const send_reminder = spacetimedb.reducer({ arg: reminder.rowType }, (_ctx, { arg }) => {
  console.log(`Reminder <>: ${arg.message}`);
});

export const schedule_timed_tasks = spacetimedb.reducer((ctx) => {
  // Schedule for 10 seconds from now
  // const tenSecondsFromNow = ctx.timestamp.microsSinceUnixEpoch + 10_000_000n;

  // 1 sec
  const tenSecondsFromNow = ctx.timestamp.microsSinceUnixEpoch + 1_000_000n;
  ctx.db.reminder.insert({
    scheduled_id: 0n,
    scheduled_at: ScheduleAt.time(tenSecondsFromNow),
    message: "Test reminder ScheduleAt",
  });

  // // Schedule for a specific Unix timestamp (microseconds since epoch)
  // const targetTime = 1735689600_000_000n; // Jan 1, 2025 00:00:00 UTC
  // ctx.db.reminder.insert({
  //   scheduled_id: 0n,
  //   scheduled_at: ScheduleAt.time(targetTime),
  //   message: "Happy New Year!",
  // });
});

export const attack = spacetimedb.reducer(
  { 
    // target_id: t.identity(),
    damage: t.u32() 
  },
  (ctx, { 
    // target_id, 
    damage 
  }) => {
    // Game logic...
    console.info("SENDER: ", ctx.sender);
    // console.info("target_id: ", target_id);

    // Publish the event
    ctx.db.damageEvent.insert({
      // entity_id: target_id,
      entity_id: ctx.sender,
      damage,
      source: "melee_attack",
    });
  }
);

// export default spacetimedb;

// export const init = spacetimedb.init(_ctx => {
//   // Called when the module is initially published
// });

// export const onConnect = spacetimedb.clientConnected(_ctx => {
//   // Called every time a new client connects
// });

// export const onDisconnect = spacetimedb.clientDisconnected(_ctx => {
//   // Called every time a client disconnects
// });

export const add = spacetimedb.reducer(
  { name: t.string() },
  (ctx, { name }) => {
    ctx.db.person.insert({ name });
    console.log('add!');
  }
);

export const sayHello = spacetimedb.reducer(ctx => {
  for (const person of ctx.db.person.iter()) {
    console.info(`Hello, ${person.name}!`);
  }
  console.info('Hello, World!');
  console.log('Hello, World!');
});

function validateName(name: string) {
  if (!name) {
    throw new SenderError('Names must not be empty');
  }
}

export const set_name = spacetimedb.reducer({ name: t.string() }, (ctx, { name }) => {
  validateName(name);
  const user = ctx.db.user.identity.find(ctx.sender);
  if (!user) {
    throw new SenderError('Cannot set name for unknown user');
  }
  ctx.db.user.identity.update({ ...user, name });
});

function validateMessage(text: string) {
  if (!text) {
    throw new SenderError('Messages must not be empty');
  }
}

export const send_message = spacetimedb.reducer({ text: t.string() }, (ctx, { text }) => {
  validateMessage(text);
  console.info(`User ${ctx.sender}: ${text}`);
  ctx.db.message.insert({
    sender: ctx.sender,
    text,
    sent: ctx.timestamp,
  });
});


export const init = spacetimedb.init(_ctx => {
  console.log("===============INIT SPACETIMEDB APP NAME:::=========");
});

export const onConnect = spacetimedb.clientConnected(ctx => {
  const user = ctx.db.user.identity.find(ctx.sender);

  console.log("SENDER: ",ctx.sender);

  if (user) {
    ctx.db.user.identity.update({ ...user, online: true });
  } else {
    ctx.db.user.insert({
      identity: ctx.sender,
      name: undefined,
      online: true,
    });
  }
});

export const onDisconnect = spacetimedb.clientDisconnected(ctx => {
  const user = ctx.db.user.identity.find(ctx.sender);
  if (user) {
    ctx.db.user.identity.update({ ...user, online: false });
  } else {
    console.warn(
      `Disconnect event for unknown user with identity ${ctx.sender}`
    );
  }
});

export const addTask = spacetimedb.reducer(
  { text: t.string(), isDone:t.bool() },
  (ctx, { text, isDone }) => {
    console.info("text:", text);
    console.info("isDone:", isDone);

    ctx.db.task.insert({
      id: 0n,
      text,
      // id: 0,
      // sender: "",
      // date: 0,
      isDone
    });
    // console.log('add task!', text);
    // console.warn('add task!', text);
  }
);

export const deleteTask = spacetimedb.reducer(
  { id: t.u64() },
  (ctx, { id }) => {
    console.log("DEL: ",id);
    // Delete matching an indexed column id
    const deleted = ctx.db.task.id.delete(id);
    console.log(`Deleted ${deleted} row(s)`);
    console.log('delete task!');
  }
);

export const updateTask = spacetimedb.reducer(
  { id: t.u64(), text: t.string(), isDone:t.bool() },
  (ctx, { id,  text, isDone}) => {
    console.info("DEL: ",id);
    console.info("id:", id);
    console.info("text:", text);
    console.info("isDone:", isDone);


    const task = ctx.db.task.id.find(id);
    console.info("task: ", task);
    if(task){
      task.text = text;
      task.isDone = isDone;
      ctx.db.task.id.update(task);
    }
    console.info('update task!');
  }
);


export default spacetimedb;


console.log("spacetime-app-map");
