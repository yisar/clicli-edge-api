import { Hono } from "https://deno.land/x/hono@v3.11.6/mod.ts";
import { cors, serveStatic } from "https://deno.land/x/hono@v3.11.6/middleware.ts"
import { streamSSE } from "https://deno.land/x/hono@v3.11.6/helper/streaming/index.ts"

const db = await Deno.openKv();
const app = new Hono();
let idCounter = 0;

interface Message {
  username: string;
  message: string;
  id: number;
}

app.use(cors());

app.get('/', serveStatic({ path: './index.html' }));

app.get('/chat', (c) => {
  return streamSSE(c, async (stream) => {
    try {
      const entries = db.list({ prefix: ["message"] });
      for await (const entry of entries) {
        const { value } = entry;

        if (value) {
          await stream.writeSSE({ data: JSON.stringify(value), event: 'new-message', id: String(entry.key[1]) });
        }
      }
    } catch (error) {
      console.error("Error during streaming:", error);
    }
  });
});

app.post('/chat', async (c) => {
  try {
    const { username, message } = await c.req.json<Message>();

    await db.set(["message", (idCounter).toString()], { username, message, id: idCounter++});
  
    return c.json({ message: 'ok' });
  } catch (error) {
    console.error("Error during streaming:", error);
    return c.json({ message: 'error' });
  }
});

Deno.serve(app.fetch);