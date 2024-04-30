import { streamSSE } from "https://deno.land/x/hono@v3.11.6/helper/streaming/index.ts"
const db = await Deno.openKv();
let idCounter = 0;


export const getChat = (c) => {
    return streamSSE(c, async (stream) => {
        try {
            const entries = db.list({ prefix: ["message"] });
            for await (const entry of entries) {
                const { value } = entry;

                if (value) {
                    await stream.writeSSE({ data: JSON.stringify(value), event: 'message', id: String(entry.key[1]) });
                }
            }
        } catch (error) {
            console.error("Error during streaming:", error);
        }
    });
}

export const postChat = async (c) => {
    try {
        const { username, message } = await c.req.json();

        await db.set(["message", (idCounter).toString()], { username, message, id: idCounter++ });

        return c.json({ message: 'ok' });
    } catch (error) {
        console.error("Error during streaming:", error);
        return c.json({ message: 'error' });
    }
}