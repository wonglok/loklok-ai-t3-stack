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
import { removeFileByPath } from "../common/removeFilePath";
export const genMongoDatabase = async ({
    slot,
    userPrompt,
    featuresText = "",
    engine,
}) => {
    ///////////////////////////////////////////////////////////////////////////////////
    // manifest
    ///////////////////////////////////////////////////////////////////////////////////
    let mongooseSpecPath = `/study/genMongoDB.json`;

    let existingCode = await readFileContent({ path: mongooseSpecPath });
    let schema = z.object({
        mongooseModels: z
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
                    .describe("each mongoose database collection"),
            )
            .describe("mongoose database collections"),
    });
    await llmRequestToFileStream({
        path: mongooseSpecPath,
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
                    content: `Please generate a list of mongoose database model`,
                },
            ] as webllm.ChatCompletionMessageParam[],
            temperature: 0.0,
            top_p: 0.05,
            response_format: {
                type: "json_object",
                schema: JSON.stringify(z.toJSONSchema(schema)),
            },
        } as webllm.ChatCompletionRequestStreaming,
        engine,
        slot: slot,
    });

    let latestModels = (await readFileParseJSON({
        path: mongooseSpecPath,
    })) as z.infer<typeof schema>;

    for (let mongoose of latestModels.mongooseModels) {
        let existingCodePath = `${mongoose.codeFilePath}`;
        let existingModelCode = await readFileContent({
            path: `${existingCodePath}`,
        });

        console.log("existingModelCode", existingModelCode);
        let hasExistingCode = existingModelCode !== "";

        let outputPath = hasExistingCode
            ? `/temp/models/${mongoose.collectionName}.diff.md`
            : `${existingCodePath}`;

        await llmRequestToFileStream({
            path: outputPath,
            request: {
                seed: 19900831,
                stream: true,
                stream_options: { include_usage: true },
                messages: [
                    {
                        role: `system`,
                        content: `${hasExistingCode ? systemPromptDiffCode : systemPromptPureText}`,
                    },
                    {
                        role: "assistant",
                        content: `Here's the "old-mongoose-model" Document:
${existingModelCode}`,
                    },

                    {
                        role: "assistant",
                        content: `Here's the latest Product Requirement Document:
${featuresText}
                            `,
                    },
                    {
                        role: `user`,
                        content: `
${
    hasExistingCode
        ? `
Please write the latest mongoose model code for "${mongoose.collectionName}" model at the file path "${mongoose.codeFilePath}";
only output diff code. `
        : `
Please write the latest mongoose model code for "${mongoose.collectionName}" model at the file path "${mongoose.codeFilePath}";
        `
}
`.trim(),
                    },
                ] as webllm.ChatCompletionMessageParam[],
                temperature: 0.0,
                top_p: 0.05,
            } as webllm.ChatCompletionRequestStreaming,
            engine,
            slot: slot,
        });

        let latestModelDiffCode = await readFileContent({
            path: `${outputPath}`,
        });

        console.log(latestModelDiffCode);
        //
    }

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
