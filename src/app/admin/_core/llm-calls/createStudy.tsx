"use client";

import { Button } from "@/components/ui/button";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { jsonSchema, streamObject, streamText, zodSchema } from "ai";
import z from "zod";
import ollama from "ollama/browser";

const test = async () => {
    const ollamaProvider = createOpenAICompatible({
        name: "ollama",
        baseURL: "http://localhost:11434/v1",
        includeUsage: true, // Include usage information in streaming responses
    });
    let modelOptions = [
        {
            modelName: "gpt-oss:20b",
            context: "128K",
            purpose: "reason",
            provider: "ollama",
        },
        {
            modelName: "gpt-oss:120b",
            context: "128K",
            purpose: "reason",
            provider: "ollama",
        },
        {
            modelName: "deepseek-coder-v2:16b",
            context: "160K",
            purpose: "code",
            provider: "ollama",
        },
        {
            modelName: "qwen2.5-coder:7b",
            context: "32K",
            purpose: "code",
            provider: "ollama",
        },
        {
            modelName: "qwen3-coder:30b",
            context: "256K",
            purpose: "code",
            provider: "ollama",
        },
    ];

    let modelCache = new Map();

    let getModel = async ({ spec, onProgress = (v) => console.log(v) }) => {
        if (!spec) {
            throw new Error("spec is undefeind");
        }
        //
        let keyname = JSON.stringify([spec.provider, spec.modelName]);

        //
        if (modelCache.has(keyname)) {
            let modelInst = modelCache.get(keyname);

            console.log(modelInst);
            return modelInst;
        }
        //
        if (spec.provider === "ollama") {
            let res = await ollama.pull({
                model: `${spec.modelName}`,
                insecure: false,
                stream: true,
            });

            for await (let prog of res) {
                onProgress(prog);
            }
            let modelInst = await ollamaProvider(spec.modelName);

            console.log("modelInst", modelInst);

            modelCache.set(keyname, modelInst);

            return modelInst;
        }

        throw new Error("not found provider");
    };

    console.log("begin call");

    let runObject = async ({ model }) => {
        let resp = streamObject({
            model: model,
            mode: "json",
            output: "object",
            schema: jsonSchema(
                z.toJSONSchema(
                    z.array(
                        z.object({
                            step: z.string(),
                        }),
                    ),
                ) as any,
            ),
            prompt: "tell me about steps of making 蘭州拉麵 metaverse",
        });

        console.log("runobj");
        for await (let output of resp.partialObjectStream) {
            console.log(output);
        }
        console.log("endobj");
    };

    let runText = async ({ model }) => {
        let resp = streamText({
            model: model,
            prompt: "tell me about steps of making 蘭州拉麵 metaverse",
        });

        console.log("runtext");
        for await (let output of resp.textStream) {
            console.log(output);
        }
        console.log("endtext");
    };

    let model = await getModel({
        spec: modelOptions[2],
        onProgress: (data) => {
            console.log(JSON.stringify(data, null, "\t"));
        },
    });

    //

    // await runText({ model });
    await runObject({ model });
    //
};

export const ButtonYo = () => {
    return (
        <Button
            onClick={() => {
                test();
            }}
        >
            Hi
        </Button>
    );
};
