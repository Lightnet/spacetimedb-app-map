import { defineConfig } from 'vite';

console.log("test");
console.log("http://localhost:5173/st_client.html");
console.log("http://localhost:5173/task.html");
console.log("http://localhost:5173/planet.html");
console.log("http://localhost:5173/svg.html");
console.log("http://localhost:5173/schedules.html");

export default defineConfig({
  server: {
    port: 5173,
  },
});
