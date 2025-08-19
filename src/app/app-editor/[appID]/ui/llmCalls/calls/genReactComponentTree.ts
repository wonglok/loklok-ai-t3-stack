"use client";

import type * as webllm from "@mlc-ai/web-llm";
import { systemPromptPureText } from "../persona/systemPromptPureText";
import { llmRequestToFileStream } from "../common/llmRequestToFileStream";
import z from "zod";
import { readFileParseJSON } from "../common/readFileParseJSON";
import { readFileContent } from "../common/readFileContent";
import { useGenAI } from "../../../useGenAI";

export const genReactComponentTree = async ({
    slot,
    userPrompt,
    featuresText = "",
    engine,
    manager,
}) => {
    ///////////////////////////////////////////////////////////////////////////////////
    // manifest
    ///////////////////////////////////////////////////////////////////////////////////
    let reactComponentSpecPath = `/docs/genReactComponentTree.json`;

    // let existingCode = await readFileContent({ path: reactComponentSpecPath });\

    let schema = z.object({
        ReactJSComponents: z
            .array(
                z
                    .object({
                        ReactJSComponentName: z.string(),
                        slug: z.string(),
                    })
                    .describe("each reactComponent item"),
            )
            .describe("reactComponent list"),
    });

    await llmRequestToFileStream({
        path: reactComponentSpecPath,
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
                //
                //
                //             {
                //                 role: "assistant",
                //                 content: `Here's the "user-requirements" Document:
                // ${userPrompt}`,
                //             },
                //
                //
                {
                    role: "assistant",
                    content: `Here's the "product requirement document" Document:
    ${featuresText}`,
                },

                {
                    role: "user",
                    content: `Please extract all reactComponent needed from the "product requirement document" make sure the slugs and the ReactJSComponentName are unique.`,
                },
            ] as webllm.ChatCompletionMessageParam[],
            temperature: 0.0,
            // top_p: 0.05,
            response_format: {
                type: "json_object",
                schema: JSON.stringify(z.toJSONSchema(schema)),
            },
        } as webllm.ChatCompletionRequestStreaming,
        engine,
        slot: slot,
    });

    let lateSpec = (await readFileParseJSON({
        path: reactComponentSpecPath,
    })) as z.infer<typeof schema>;

    manager?.addTask({
        displayName: `React JS Entry App`,
        name: "entry/App",
        deps: ["genFeatrues"],
        func: async () => {
            let outputPath = `/entry/App.ts`;

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
                                `Here's the latest Product "Requirement Document":
${featuresText}
                                `.trim(),
                        },

                        {
                            role: `user`,
                            content: `
- only write the typescript code block 
- please use modules with typescript 
- use tailwind css
- DO NOT include '@/...' at the beginning of import url like this: "import { Button } from '@/components/ui/button';" (wrong)
- MUST use '/' at the beginning of import url like this: "import { Button } from '/components/ui/button';" (good and right)
- Use Vanilla JSX html with Tailwind CSS
- DO NOT import shadcn components from "/components/..."

export const App = () => {
    return ...
};

`.trim(),
                        },
                    ] as webllm.ChatCompletionMessageParam[],
                    temperature: 0.0,
                    // top_p: 0.05,
                } as webllm.ChatCompletionRequestStreaming,
                engine,
                slot: slot,
            });
        },
    });

    for (let reactComponent of lateSpec.ReactJSComponents) {
        if (!reactComponent.slug.startsWith("/")) {
            reactComponent.slug = `${reactComponent.slug}`;
        }
        console.log("manager.addTask", reactComponent.slug);

        manager?.addTask({
            displayName: `React JS Component ${reactComponent.ReactJSComponentName}`,
            name: reactComponent.slug,
            deps: ["genFeatrues"],
            func: async ({ slot, engine }) => {
                console.log("begin-task", reactComponent.slug);

                let outputPath = `/react/${reactComponent.slug}.ts`;

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
Please write the latest reactComponent component typescript code for "${reactComponent.ReactJSComponentName}" component.

- only write the typescript code block 
- please use modules with typescript 
- use tailwind css
- DO NOT include '@/...' at the beginning of import url like this: "import { Button } from '@/components/ui/button';" (wrong)
- MUST use '/' at the beginning of import url like this: "import { Button } from '/components/ui/button';" (good and right)
- Use Vanilla JSX html with Tailwind CSS
- DO NOT import shadcn components from "/components/..."

export const ${`${JSON.stringify(reactComponent.ReactJSComponentName)}ReactComponent`} = () => {
    return ...
};

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

        //
    }

    //     ///////////////////////////////////////////////////////////////////////////////////
    //     // usecase
    //     ///////////////////////////////////////////////////////////////////////////////////
};
