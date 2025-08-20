"use client";

import type * as webllm from "@mlc-ai/web-llm";
import { systemPromptPureText } from "../persona/systemPromptPureText";
import { llmRequestToFileStream } from "../common/llmRequestToFileStream";
import z from "zod";
import { readFileParseJSON } from "../common/readFileParseJSON";
import { readFileContent } from "../common/readFileContent";
import slugify from "slugify";
import { useGenAI } from "../../../useGenAI";
// import { useGenAI } from "../../../useGenAI";

export const genSDK = async ({
    slot,
    featuresText = "",
    engine,
    userPrompt,
    manager,
}) => {
    //
    let schema = z.object({
        databaseCollections: z
            .array(
                z
                    .object({
                        CollectionName: z.string(),
                        slug: z.string(),
                    })
                    .describe("each collection"),
            )
            .describe("mongoose models"),

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

        zustandFrontEnd: z
            .array(
                z
                    .object({
                        dataName: z.string(),
                        dataType: z.enum(["array", "string", "boolean"]),
                        defaultValue: z.enum(["[]", "''", "false"]),
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
    });
    type SpecType = z.infer<typeof schema>;

    manager?.addTask({
        displayName: `Gen`,
        name: "genSDK",
        deps: ["genFeatrues"],
        func: async ({ slot, engine }) => {
            ///////////////////////////////////////////////////////////////////////////////////
            // manifest
            ///////////////////////////////////////////////////////////////////////////////////
            let specificationPath = `/docs/genSDK.json`;

            // let existingCode = await readFileContent({ path: specificationPath });\

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
            })) as SpecType;

            console.log(lateSpec);
            //
            await scheduleTaskMongooseModule({ lateSpec });
            await scheduleTaskMongooseIntegration({ lateSpec });

            //
            await scheduleTasktRPCBackendModule({ lateSpec });
            await scheduleTasktRPCBackendIntegration({ lateSpec });

            //
            await scheduleTasktRPCBackendModule({ lateSpec });
            await scheduleTasktRPCBackendIntegration({ lateSpec });
        },
    });

    let scheduleTaskMongooseModule = ({ lateSpec }: { lateSpec: SpecType }) => {
        for (let mongoose of lateSpec.databaseCollections) {
            console.log("manager.addTask", mongoose.slug);

            mongoose.slug = `${slugify(mongoose.slug, { lower: true, replacement: "-" })}`;

            manager?.addTask({
                displayName: `${mongoose.CollectionName}`,
                name: mongoose.slug,
                deps: [],
                func: async ({ slot, engine }) => {
                    console.log("begin-task", mongoose.slug);

                    // let existingCodePath = `${mongoose.slug}`;
                    // let existingModelCode = await readFileContent({
                    //     path: `${existingCodePath}`,
                    // });
                    // console.log("existingModelCode", existingModelCode);
                    // let hasExistingCode = existingModelCode !== "";

                    let outputPath = `/models/${mongoose.slug}.ts`;

                    await llmRequestToFileStream({
                        path: outputPath,
                        needsExtractCode: true,
                        request: {
                            max_tokens: 4096,
                            seed: 19900831,
                            stream: true,
                            stream_options: { include_usage: true },
                            messages: [
                                {
                                    role: "assistant",
                                    content:
                                        `Here's the latest Product Requirement Document:
${featuresText}
                            `.trim(),
                                },
                                {
                                    role: `user`,
                                    content: `
Please write the latest mongoose model typescript code for "${mongoose.CollectionName}" model.

- only write the typescript code block 
- please use modules with typescript 

- DO NOT INCLUDE "import mongoose from 'mongoose';" 
- MUST INCLUDE this "getEachModel" typescript function:

export function getEachModel ({ mongoose, appID, dbInstance }) {
    const db = dbInstance // mongoose.connection.useDb("app_development_appID", { useCache: true });

    const ${`${JSON.stringify(mongoose.CollectionName)}Schema`} = [...];

    if (!db.models[${JSON.stringify(mongoose.CollectionName)}]) {
        db.model(${JSON.stringify(mongoose.CollectionName)}, ${`${JSON.stringify(mongoose.CollectionName)}Schema`});
    }

    return db.model("${mongoose.CollectionName}");
}

`.trim(),
                                },
                            ] as webllm.ChatCompletionMessageParam[],
                            temperature: 0.0,
                            // top_p: 0.05,
                        } as webllm.ChatCompletionRequestStreaming,
                        engine,
                        slot: slot,
                    });

                    let latestCodeWritten = await readFileContent({
                        path: `${outputPath}`,
                    });

                    console.log(latestCodeWritten);
                },
            });
        }
    };
    let scheduleTaskMongooseIntegration = ({
        lateSpec,
    }: {
        lateSpec: SpecType;
    }) => {
        // mongoose.connection.useDb("app_development_appID", { useCache: true });

        manager?.addTask({
            displayName: `Mongoose Integration`,
            name: "mongoose_integration",
            deps: [],
            func: async ({ slot, engine }) => {
                console.log("begin-task", "mongoose_integration");

                let outputPath = `/models/mongoose_integration.ts`;

                await llmRequestToFileStream({
                    path: outputPath,
                    needsExtractCode: true,
                    request: {
                        max_tokens: 4096,
                        seed: 19900831,
                        stream: true,
                        stream_options: { include_usage: true },
                        messages: [
                            {
                                role: "assistant",
                                content:
                                    `Here's the latest Product Requirement Document:
${featuresText}
                                    `.trim(),
                            },
                            {
                                role: "assistant",
                                content: `
# Task 
Please include all collections 
`,
                            },
                            {
                                role: `user`,
                                content: `Here's the code template:

const dbInstance = mongoose.connection.useDb("app_development_" + appID, { useCache: true });


`.trim(),
                            },
                            {
                                role: `user`,
                                content: `

- Only write the typescript code block
- Use modules with typescript

- DO NOT INCLUDE "import mongoose from 'mongoose';" 
- MUST INCLUDE this "getAllModels" typescript function:

`.trim(),
                            },
                        ] as webllm.ChatCompletionMessageParam[],
                        temperature: 0.0,
                        // top_p: 0.05,
                    } as webllm.ChatCompletionRequestStreaming,
                    engine,
                    slot: slot,
                });
                let latestCodeWritten = await readFileContent({
                    path: `${outputPath}`,
                });
                console.log(latestCodeWritten);
            },
        });
    };

    let scheduleTasktRPCBackendModule = ({
        lateSpec,
    }: {
        lateSpec: SpecType;
    }) => {
        //
    };
    let scheduleTasktRPCBackendIntegration = ({
        lateSpec,
    }: {
        lateSpec: SpecType;
    }) => {
        //
    };

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
