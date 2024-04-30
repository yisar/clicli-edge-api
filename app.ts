import { Hono } from "https://deno.land/x/hono@v3.11.6/mod.ts";
import { cors, serveStatic } from "https://deno.land/x/hono@v3.11.6/middleware.ts"
import { getChat, postChat } from "./src/chat";

const app = new Hono();

app.use(cors());

app.get('/', serveStatic({ path: './index.html' }));

app.get('/chat', getChat);

app.post('/chat', postChat);

Deno.serve(app.fetch);