import { Midjourney } from "midjourney";

export const runtime = "edge";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const client = new Midjourney({
    ServerId: <string>process.env.SERVER_ID,
    ChannelId: <string>process.env.CHANNEL_ID,
    SalaiToken: <string>process.env.SALAI_TOKEN,
    Debug: true,
    Ws: process.env.WS === "true",
  });
  await client.init();

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    start(controller) {
      const enqueue = <T>(body: T) =>
        controller.enqueue(encoder.encode(JSON.stringify(body)));
      client
        .Imagine(prompt, (uri: string, progress: string) => {
          enqueue({ type: "progress", uri, progress });
        })
        .then((msg) => {
          if (msg !== null) {
            enqueue({ type: "done", ...msg });
          } else {
            enqueue({ type: "error", err: "No response" });
          }
        })
        .catch((err) => {
          enqueue({ type: "error", err });
        })
        .finally(() => {
          client.Close();
          controller.close();
        });
    },
  });
  return new Response(readable, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
