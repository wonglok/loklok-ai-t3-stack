"use client";

import type * as webllm from "@mlc-ai/web-llm";
import { systemPromptPureText } from "../persona/systemPromptPureText";
import { llmRequestToFileStream } from "../common/llmRequestToFileStream";
import z from "zod";
import { readFileParseJSON } from "../common/readFileParseJSON";
import { readFileContent } from "../common/readFileContent";
import { useGlobalAI } from "../../../useGlobalAI";

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
        reactComponentModels: z
            .array(
                z
                    .object({
                        itemName: z.string().describe("ReactJS Components"),
                        codeFilePath: z.string().describe(
                            `example:  
                                "/react/"itemName".js"
                                Change "itemName" to the React JS Component name accrodingly 
                            `,
                        ),
                    })
                    .describe("each reactComponent item"),
            )
            .describe("reactComponent list"),
    });
    await llmRequestToFileStream({
        path: reactComponentSpecPath,
        request: {
            seed: 19900831,
            stream: true,
            stream_options: { include_usage: true },
            messages: [
                {
                    role: `system`,
                    content: `${systemPromptPureText}`,
                },
                {
                    role: "assistant",
                    content: `Here's the "user-requirements" Document:
    ${userPrompt}`,
                },
                {
                    role: "assistant",
                    content: `Here's the "Use case and Features" Document:
    ${featuresText}`,
                },

                {
                    role: "user",
                    content: `Please generate a list of reactComponent model`,
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

    for (let reactComponent of lateSpec.reactComponentModels) {
        if (!reactComponent.codeFilePath.startsWith("/")) {
            reactComponent.codeFilePath = `/${reactComponent.codeFilePath}`;
        }
        console.log("manager.addTask", reactComponent.codeFilePath);

        manager?.addTask({
            name: reactComponent.codeFilePath,
            deps: [],
            func: async ({ slot, engine }) => {
                console.log("begin-task", reactComponent.codeFilePath);

                let outputPath = `${reactComponent.codeFilePath}`;

                await llmRequestToFileStream({
                    path: reactComponent.codeFilePath,
                    needsExtractCode: true,
                    request: {
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
Please write the latest reactComponent component javascript code for "${reactComponent.itemName}" component.

- only write the javascript code block 
- please use esm javascript and es6

export const ${`${JSON.stringify(reactComponent.itemName)}ReactComponent`} = () => {

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
