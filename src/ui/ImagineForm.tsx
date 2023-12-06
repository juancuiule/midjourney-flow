"use client";

import { API, ChunkType, ProgressChunk } from "@/api";
import { Dispatch, SetStateAction, useState } from "react";

function ProgressPreview({ chunk }: { chunk: ProgressChunk }) {
  const { uri, progress } = chunk;
  return (
    <div className="w-full flex flex-col">
      <img className="w-full aspect-video" src={uri} />
      <p>{progress}</p>
    </div>
  );
}

function RenderChunk({
  chunk,
  setState,
}: {
  chunk: ChunkType;
  setState: Dispatch<SetStateAction<ChunkType | null>>;
}) {
  switch (chunk.type) {
    case "progress":
      return <ProgressPreview chunk={chunk} />;
    case "done": {
      const { uri, options = [] } = chunk;
      return (
        <div className="w-full flex flex-col gap-4">
          <img className="w-full aspect-video" src={uri} />
          <div className="grid grid-cols-5 gap-2">
            {options.map((option) => (
              <button
                key={option.label}
                className="flex items-center justify-center p-1 border border-black rounded hover:bg-gray-400 transition-colors"
                onClick={() => {
                  if (option.label.startsWith("V")) {
                    // API.variation
                    // const { content, index, msgId, msgHash, flags } = await req.json();
                    const body = {
                      content: chunk.content,
                      msgId: chunk.id,
                      flags: chunk.flags,
                      msgHash: chunk.hash,
                      index: 1,
                    };
                    API.variation(body, (chunk) => {
                      console.log({ chunk });
                      setState(chunk);
                    });
                  }
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      );
    }
    default:
      return <p>Unknown chunk type: {chunk.type}</p>;
  }
}

export default function ImagineForm() {
  const [state, setState] = useState<ChunkType | null>(null);

  return (
    <div className="w-full max-w-xl border border-black p-6 rounded flex flex-col gap-8">
      {state && <RenderChunk chunk={state} setState={setState} />}
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const prompt = formData.get("prompt") as string;
          API.imagine(prompt, (chunk) => {
            setState(chunk);
          });
        }}
      >
        <div className="flex flex-col gap-2">
          <label className="text-md font-medium" htmlFor="prompt">
            Prompt
          </label>
          <input
            className={`border rounded-md h-10 px-2 outline-info flex`}
            id="prompt"
            name="prompt"
            type="text"
            placeholder="Your prompt"
          />
        </div>
        <button type="submit">Imagine</button>
      </form>
    </div>
  );
}
