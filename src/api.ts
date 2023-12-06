import { MJMessage } from "midjourney";

export type ProgressChunk = { type: "progress"; uri: string; progress: string };
export type DoneChunk = { type: "done" } & MJMessage;
export type ErrorChunk = { type: "error"; err: string };

export type ChunkType = ProgressChunk | DoneChunk | ErrorChunk;

const handleWithStream = async <T>(
  promise: Promise<Response>,
  handleChunk: (chunk: T) => void
) => {
  try {
    const response = await promise;
    if (!response.ok || !response.body) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log("Stream is closed");
        break;
      }

      const result = JSON.parse(new TextDecoder().decode(value));
      handleChunk(result);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const API = {
  imagine: async (prompt: string, onChunk: (chunk: ChunkType) => void) => {
    handleWithStream(
      fetch("http://localhost:3000/api/imagine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      }),
      onChunk
    );
  },
  variation: async (body: any, onChunk: (chunk: ChunkType) => void) => {
    handleWithStream(
      fetch("http://localhost:3000/api/variation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }),
      onChunk
    );
  },
};
