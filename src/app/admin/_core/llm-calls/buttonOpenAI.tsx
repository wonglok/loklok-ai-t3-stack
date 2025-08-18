"use client";

import { Button } from "@/components/ui/button";
// import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
// import { jsonSchema, streamObject, streamText, zodSchema } from "ai";
// import z from "zod";
// import ollama from "ollama/browser";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const buttonOpenAI = async () => {
    const openai = new OpenAI({
        apiKey: "",
        dangerouslyAllowBrowser: true,
        // baseURL: "http://localhost:1234/v1",
        baseURL: "http://localhost:11434/v1",
    });
    // `z.lazy()` can't infer recursive types so we have to explicitly
    // define the type ourselves here

    const FoodSchema = z.object({
        steps: z.array(z.string().describe("step")),
    });

    async function main() {
        const stream = openai.chat.completions.stream({
            stream: true,
            model: "gpt-oss:20b",
            // model: "openai/gpt-oss-20b",
            messages: [
                // {
                //     role: "system",
                //     content: "",
                // },
                {
                    role: "user",
                    content: "teach me how to cook lasagnia, all the steps",
                },
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    strict: true,
                    name: "json",
                    schema: z.toJSONSchema(FoodSchema, {
                        target: "draft-7",
                    }),
                },
            },
        });

        let reader = await stream.toReadableStream().getReader();

        let dec = new TextDecoder();
        let allText = "";
        let run = async () => {
            let res = await reader.read();

            let text = dec.decode(res.value);

            try {
                let json = JSON.parse(text);
                let content = json?.choices[0]?.delta?.content;
                if (content) {
                    allText += content;
                    console.log(JSON.parse(allText));
                }
            } catch (e) {
                // console.log(e);
            }

            if (!res.done) {
                await run();
            }
        };
        await run();
    }

    main();
};

export const ButtonOpenAI = () => {
    return (
        <Button
            onClick={() => {
                buttonOpenAI();
            }}
        >
            ButtonOpenAI
        </Button>
    );
};
