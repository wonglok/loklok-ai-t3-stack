"use client";

import type * as webllm from "@mlc-ai/web-llm";
import { systemPromptDiffCode } from "../persona/systemPromptDiffCode";
import { writeToFile } from "../common/writeToFile";
import { llmRequestToFileStream } from "../common/llmRequestToFileStream";
import { readFileContent } from "../common/readFileContent";
import { EngineData } from "../../../useGenAI";

export const genDiff = async ({
    userPrompt,
    engine,
    slot,
}: {
    userPrompt: string;
    engine: webllm.MLCEngineInterface;
    slot: EngineData;
}) => {
    ///////////////////////////////////////////////////////////////////////////////////
    // manifest
    ///////////////////////////////////////////////////////////////////////////////////
    let existingCode = `
`;

    let messages: webllm.ChatCompletionMessageParam[] = [
        {
            role: `system`,
            content: `${systemPromptDiffCode}`,
        },
        //
        // {
        //     role: `user`,
        //     content: `I will show you the existing code in next message.`,
        // },
        //
        // {
        //     role: `user`,
        //     content: `${existingCode}`,
        // },
        //
        {
            role: `assistant`,
            content: `I will show you the "Product Requirement Definition" in next message.`,
        },
        {
            role: "assistant",
            content: `
I want to build a bible testimony app powered by ai embedding.

## PlatformAdmin:
PlatformAdmin can login to Platform Portal. 
PlatformAdmin can create Pastor's Login Accounts and help Pastors reset password.

## Pastor:
Pastors can login to Pastor Portal.

Pastor Portal can do a few things:
1. upload testimony text and youtube video link 
2. edit testimony and set it to be hidden or visible.
3. generate embeddings data for the testimony.
4. approve and publish the testimony to their pastor account.

## Internet users:
Internet Users can visit public web app at home page of the webiste. 
In Public webapp, they can view testimonty preview, video and text.
In Public webapp, they can search testimonty powered by ai.

Internet Users can login to their user profile.
In User Profile, they can write testimony and request pastor to approve for publishing to public.
`,
        },
        {
            role: `user`,
            content: `implement the mongoose database models in typescript modules according to "Product Requirement Definition". organise each model in their own file.`,
        },
        {
            role: `user`,
            content: `output diffcode only`,
        },
    ];

    //https://github.com/pylarco/diff-apply?tab=readme-ov-file#llm-integration-and-prompting-guide
    //https://github.com/pylarco/diff-apply?tab=readme-ov-file#llm-integration-and-prompting-guide
    //https://github.com/pylarco/diff-apply?tab=readme-ov-file#llm-integration-and-prompting-guide

    const request: webllm.ChatCompletionRequestStreaming = {
        seed: 19900831,
        stream: true,
        stream_options: { include_usage: true },
        messages: messages,
        temperature: 0.0,
        max_tokens: 4096,
    };

    await writeToFile({
        path: "existingCode.js",
        content: `${existingCode}`,
    });

    let path = `/ppap/diff_gen.md`;

    await llmRequestToFileStream({
        path: path,
        request: request,
        engine,
        slot: slot,
    });

    let diffText = await readFileContent({ path });

    console.log(diffText);

    let parseDiff = await import("parse-diff").then(
        async ({ default: parseDiff }) => {
            return parseDiff;
        },
    );

    let item = await parseDiff(diffText);
    console.log(item);

    /*
// let diffList = await parseDiff(diffText);
// console.log(diffList);
// for (let block of diffList) {
//     console.log(JSON.stringify(block, null, "\t"));
// }
// let strategy = diffApply.newUnifiedDiffStrategy.create(0.6);
// let allResults = (await strategy.applyDiff({
//     //
//     originalContent: `${existingCode}`,
//     diffContent: `\`\`\`diff\n${eachBlock.code}\n\`\`\``,
// })) as any;
// console.log(allResults);
// for (let eachResult of allResults) {
//     console.log(eachResult, eachResult.content);
//     await WebLLMAppClient.writeToFile({
//         path: eachResult.to,
//         content: eachResult.content,
//     });
// }
// let blocks = await WebLLMAppClient.extractAllCodeBlocks({
//     markdown: diffText,
// });
// for (let eachBlock of blocks) {
// }
            */

    // // const strategy = newUnifiedDiffStrategyService.create(0.95); // 95% confidence required

    ///////////////////////////////////////////////////////////////////////////////////
    // usecase
    ///////////////////////////////////////////////////////////////////////////////////
};

{
}
