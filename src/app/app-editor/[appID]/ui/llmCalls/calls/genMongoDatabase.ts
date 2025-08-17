"use client";

import type * as webllm from "@mlc-ai/web-llm";
import { systemPromptPureText } from "../persona/systemPromptPureText";
import { llmRequestToFileStream } from "../common/llmRequestToFileStream";
import z from "zod";
// import { systemPromptDiffCode } from "../persona/systemPromptDiffCode";
// import { writeToFile } from "../common/writeToFile";
import { readFileContent } from "../common/readFileContent";
// import { newUnifiedDiffStrategy } from "diff-apply";
import { readFileParseJSON } from "../common/readFileParseJSON";
// import { removeFileByPath } from "../common/removeFilePath";
import { useGlobalAI } from "../../../useGlobalAI";
export const genMongoDatabase = async ({
    slot,
    userPrompt,
    featuresText = "",
    engine,
    manager = null,
}) => {
    ///////////////////////////////////////////////////////////////////////////////////
    // manifest
    ///////////////////////////////////////////////////////////////////////////////////
    let mongooseSpecPath = `/docs/genMongoDB.json`;

    // let existingCode = await readFileContent({ path: mongooseSpecPath });
    let schema = z.object({
        mongooseModels: z
            .array(
                z
                    .object({
                        collectionName: z.string(),
                        slug: z.string(),
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
            // top_p: 0.05,
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
        if (!mongoose.slug.startsWith("/")) {
            mongoose.slug = `/models/${mongoose.slug}`;
        }
        console.log("manager.addTask", mongoose.slug);

        manager?.addTask({
            name: mongoose.slug,
            deps: [],
            func: async ({ slot, engine }) => {
                console.log("begin-task", mongoose.slug);
                //

                // let existingCodePath = `${mongoose.slug}`;
                // let existingModelCode = await readFileContent({
                //     path: `${existingCodePath}`,
                // });

                // console.log("existingModelCode", existingModelCode);
                // let hasExistingCode = existingModelCode !== "";

                let outputPath = `${mongoose.slug}`;

                await llmRequestToFileStream({
                    path: mongoose.slug,
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
Please write the latest mongoose model javascript code for "${mongoose.collectionName}" model.

- only write the javascript code block 
- please use esm modules javascript and ecma script ES6 javascript

- MUST INCLUDE this next line:
const db = mongoose.connection.useDb("app_development_${useGlobalAI.getState().appID}", { useCache: true });

const ${`${JSON.stringify(mongoose.collectionName)}Schema`} = [...];

if (!db.models[${JSON.stringify(mongoose.collectionName)}]) {
    db.model(${JSON.stringify(mongoose.collectionName)}, ${`${JSON.stringify(mongoose.collectionName)}Schema`});
}

- MUST INCLUDE this next line:
export model like: export default db.model("${mongoose.collectionName}")
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

    // let existingCode = "";
    // await writeToFile({
    //     path: ``,
    //     content: `${existingCode}`,
    // });

    // let path = `/docs/genMongoDB.diff.md`;

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
