"use client";

import type * as webllm from "@mlc-ai/web-llm";
import { systemPromptPureText } from "../persona/systemPromptPureText";
import { llmRequestToFileStream } from "../common/llmRequestToFileStream";
import z from "zod";
import { readFileParseJSON } from "../common/readFileParseJSON";
import { readFileContent } from "../common/readFileContent";
// import { useGenAI } from "../../../useGenAI";

export const genZustand = async ({
    slot,
    featuresText = "",
    engine,
    userPrompt,
    manager,
}) => {
    manager?.addTask({
        displayName: `Zustand Task`,
        name: "genZustand",
        deps: ["genFeatrues"],
        func: async ({ slot, engine }) => {
            ///////////////////////////////////////////////////////////////////////////////////
            // manifest
            ///////////////////////////////////////////////////////////////////////////////////
            let specificationPath = `/docs/genZustand.json`;

            // let existingCode = await readFileContent({ path: specificationPath });\

            let schema = z.object({
                zustandFrontEnd: z
                    .array(
                        z
                            .object({
                                dataName: z.string(),
                                dataType: z.string(),
                            })
                            .describe("each data property"),
                    )
                    .describe("front end zustand"),
                tRPCFrontEnd: z
                    .array(
                        z
                            .object({
                                procedureName: z.string(),
                                slug: z.string(),
                            })
                            .describe("each Module item"),
                    )
                    .describe("front end tRPC"),
                tRPCBackEnd: z
                    .array(
                        z
                            .object({
                                procedureName: z.string(),
                                slug: z.string(),
                            })
                            .describe("each Module item"),
                    )
                    .describe("backend tRPC"),
            });

            await llmRequestToFileStream({
                path: specificationPath,
                request: {
                    max_tokens: 4096,
                    seed: 19900831,
                    stream: true,
                    stream_options: { include_usage: true },
                    messages: [
                        {
                            role: `system`,
                            content: `${systemPromptPureText}`,
                        },
                        // "Backend tRPC APIs" and "Backend"

                        //
                        //
                        //             {
                        //                 role: "assistant",
                        //                 content: `Here's the "user-requirements" Document:
                        // ${userPrompt}`,
                        //             },
                        //
                        //
                        //

                        {
                            role: "assistant",
                            content: `Here's the "product requirement document" Document:
    ${featuresText}`,
                        },

                        {
                            role: "user",
                            content: `
- Please extract all tRPC front end needed from the "product requirement document" 
- make sure the slugs and the MoudleName are unique.
- also include the App (Root component) with slug "app-root"`,
                        },
                    ] as webllm.ChatCompletionMessageParam[],
                    temperature: 0.0,
                    response_format: {
                        type: "json_object",
                        schema: JSON.stringify(z.toJSONSchema(schema)),
                    },
                } as webllm.ChatCompletionRequestStreaming,
                engine,
                slot: slot,
            });

            let lateSpec = (await readFileParseJSON({
                path: specificationPath,
            })) as z.infer<typeof schema>;

            console.log(lateSpec);
        },
    });

    //     for (let reactComponent of lateSpec.tRPCFrontEnd) {
    //         if (!reactComponent.slug.startsWith("/")) {
    //             reactComponent.slug = `${reactComponent.slug}`;
    //         }
    //         console.log("manager.addTask", reactComponent.slug);

    //         manager?.addTask({
    //             displayName: `React JS Component ${reactComponent.ReactJSComponentName}`,
    //             name: reactComponent.slug,
    //             deps: ["genFeatrues"],
    //             func: async ({ slot, engine }) => {
    //                 console.log("begin-task", reactComponent.slug);

    //                 let outputPath = `/components/${reactComponent.slug}.tsx`;

    //                 await llmRequestToFileStream({
    //                     path: outputPath,
    //                     needsExtractCode: true,
    //                     request: {
    //                         max_tokens: 4096,
    //                         seed: 19900831,
    //                         stream: true,
    //                         stream_options: { include_usage: true },
    //                         messages: [
    //                             {
    //                                 role: "assistant",
    //                                 content: `
    // Here's the latest "Product Requirement Document":

    // ${featuresText}
    // `.trim(),
    //                             },
    //                             {
    //                                 role: "user",
    //                                 content: `
    // Please write the Zustand Store according to with reference to the "Product Requirement Document":

    // - Call it "useAPIStore"
    // - Only write one Typescript code block
    // - Use modules with Typescript

    // - DO NOT include '@/...' at the beginning of import url like this: "import { Button } from '@/components/button';" (wrong)
    // - MUST use '/' at the beginning of import url like this: "import { Button } from '/components/button';" (good and right)

    // export const ${`${JSON.stringify(reactComponent.ReactJSComponentName)}ReactComponent`} = () => {
    //     return ...
    // };

    //     `.trim(),
    //                             },
    //                         ] as webllm.ChatCompletionMessageParam[],
    //                         temperature: 0.0,
    //                         // top_p: 0.05,
    //                     } as webllm.ChatCompletionRequestStreaming,
    //                     engine,
    //                     slot: slot,
    //                 });

    //                 // let latestCodeWritten = await readFileContent({
    //                 //     path: `${outputPath}`,
    //                 // });

    //                 // console.log(latestCodeWritten);
    //             },
    //         });

    //         //
    //     }

    //     ///////////////////////////////////////////////////////////////////////////////////
    //     // usecase
    //     ///////////////////////////////////////////////////////////////////////////////////
};
