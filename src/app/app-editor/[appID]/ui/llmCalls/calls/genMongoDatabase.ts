"use client";

import type * as webllm from "@mlc-ai/web-llm";
import { systemPromptPureText } from "../persona/systemPromptPureText";
import { llmRequestToFileStream } from "../common/llmRequestToFileStream";
import z from "zod";
import { systemPromptDiffCode } from "../persona/systemPromptDiffCode";
import { writeToFile } from "../common/writeToFile";
import { readFileContent } from "../common/readFileContent";
import { newUnifiedDiffStrategy } from "diff-apply";
import { readFileParseJSON } from "../common/readFileParseJSON";
export const genMongoDatabase = async ({
    slot,
    userPrompt,
    featuresText = "",
    engine,
}) => {
    ///////////////////////////////////////////////////////////////////////////////////
    // manifest
    ///////////////////////////////////////////////////////////////////////////////////

    let latestJSONPath = `/study/genMongoDB.json`;
    await llmRequestToFileStream({
        path: latestJSONPath,
        request: {
            seed: 19900831,
            stream: true,
            stream_options: { include_usage: true },
            messages: [
                {
                    role: `system`,
                    content: `${systemPromptDiffCode}`,
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
                    role: `user`,
                    content: `implement the mongoose database models in javascript es6 modules according to "Product Requirement Definition". organise each model in their own file.`,
                },
                {
                    role: `user`,
                    content: `output diffcode only, don't output comments or notes`,
                },
            ] as webllm.ChatCompletionMessageParam[],
            temperature: 0.0,
            response_format: {
                type: "json_object",
                schema: JSON.stringify(
                    z.toJSONSchema(
                        z.object({
                            version: z.literal("2025-08-12---init"),
                            mongoose: z
                                .array(
                                    z
                                        .object({
                                            collectionName: z.string(),
                                            codeFilePath: z.string().describe(
                                                `example:  
                                                    "/model/[CollectionName].model.js"
                                                    
                                                    Change [CollectionName] to the item name accrodingly 
                                                `,
                                            ),
                                        })
                                        .describe(
                                            "each mongoose database collection",
                                        ),
                                )
                                .describe("mongoose database collections"),
                        }),
                    ),
                ),
            },
        } as webllm.ChatCompletionRequestStreaming,
        engine,
        slot: slot,
    });

    let newJSON = await readFileParseJSON({ path: latestJSONPath });

    console.log(newJSON);

    // let existingCode = "";
    // await writeToFile({
    //     path: ``,
    //     content: `${existingCode}`,
    // });

    // let path = `/study/genMongoDB.diff.md`;

    // await llmRequestToFileStream({
    //     path: path,
    //     request: {
    //         ...request,
    //     },
    //     engine,
    //     slot: slot,
    // });

    // let diffText = await readFileContent({ path });

    // console.log(diffText);

    // let parseDiff = await import("parse-diff").then(
    //     async ({ default: parseDiff }) => {
    //         return parseDiff;
    //     },
    // );

    // let item = await parseDiff(diffText);

    // console.log(item);

    // const strategy = newUnifiedDiffStrategy.create(0.95); // 95% confidence required

    // let result = await strategy.applyDiff({
    //     originalContent: existingCode,
    //     diffContent: diffText,
    // });

    ///////////////////////////////////////////////////////////////////////////////////
    // usecase
    ///////////////////////////////////////////////////////////////////////////////////
};
