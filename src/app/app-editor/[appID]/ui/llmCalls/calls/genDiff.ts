"use client";

import type * as webllm from "@mlc-ai/web-llm";
import { systemPromptDiffCode } from "../persona/systemPromptDiffCode";
import { writeToFile } from "../common/writeToFile";
import { llmRequestToFileStream } from "../common/llmRequestToFileStream";
import { readFileContent } from "../common/readFileContent";
import { EngineData } from "../../../useGenAI";
import z from "zod";

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
            content: `implement the mongoose database models in typescript modules according to "Product Requirement Definition". organise each model in their own codeblock one by one`,
        },
        {
            role: `user`,
            content: `output diffcode only`,
        },
    ];

    //https://github.com/pylarco/diff-apply?tab=readme-ov-file#llm-integration-and-prompting-guide
    //https://github.com/pylarco/diff-apply?tab=readme-ov-file#llm-integration-and-prompting-guide
    //https://github.com/pylarco/diff-apply?tab=readme-ov-file#llm-integration-and-prompting-guide

    // const tools: Array<webllm.ChatCompletionTool> = [
    //     {
    //         type: "function",
    //         function: {
    //             name: "write_file",
    //             description: "write file content at filePath",
    //             parameters: {
    //                 type: "object",
    //                 properties: {
    //                     filePath: {
    //                         type: "string",
    //                         description: "the file path",
    //                     },
    //                     content: {
    //                         type: "string",
    //                         description: "the file content",
    //                     },
    //                 },
    //                 required: ["filePath", "content"],
    //             },
    //         },
    //     },

    //     {
    //         type: "function",
    //         function: {
    //             name: "read_file",
    //             description: "read file content at filePath",
    //             parameters: {
    //                 type: "object",
    //                 properties: {
    //                     filePath: {
    //                         type: "string",
    //                         description: "the file path",
    //                     },
    //                 },
    //                 required: ["filePath"],
    //             },
    //         },
    //     },
    // ];
    //
    // tool_choice: "auto",
    // tools: tools,

    // console.log(webllm.functionCallingModelIds);

    // const request: webllm.ChatCompletionRequest = {
    //     tools,
    //     tool_choice: "auto",

    //     // seed: 19900831,
    //     // stream: false,
    //     // stream_options: { include_usage: true },
    //     messages: [
    //         {
    //             role: "user",
    //             content: `write a hello world to world.txt reply me in json`,
    //         },
    //     ], //messages,
    //     temperature: 0.0,
    //     max_tokens: 4096,
    // };

    // await writeToFile({
    //     path: "existingCode.js",
    //     content: `${existingCode}`,
    // });

    // let path = `/ppap/diff_gen.md`;

    // await llmRequestToFileStream({
    //     path: path,
    //     request: request,
    //     engine: engine,
    //     needsExtractCode: true,
    //     slot,
    // });

    // const tools: Array<webllm.ChatCompletionTool> = [
    //     {
    //         type: "function",
    //         function: {
    //             name: "get_current_weather",
    //             description: "Get the current weather of a place / location",
    //             parameters: z.toJSONSchema(
    //                 z.object({
    //                     location: z
    //                         .string()
    //                         .describe("place name or location name"),
    //                 }),
    //             ),
    //         },
    //     },
    // ];

    // const request = {
    //     stream: false, // works with stream as well, where the last chunk returns tool_calls
    //     // stream_options: { include_usage: true },
    //     messages: [
    //         {
    //             role: "user",
    //             content: "Get the current weather in Hong Kong",
    //         },
    //     ],
    //     tool_choice: "auto",
    //     tools: tools,
    //     response_format: {
    //         type: "json_object",
    //     },
    // } as webllm.ChatCompletionRequest;

    // if (!request.stream) {
    //     await engine.resetChat();
    //     let resp = await engine.chat.completions.create(
    //         request as webllm.ChatCompletionRequest,
    //     );
    //     console.log(resp);
    // } else {
    //     await engine.resetChat();
    //     let chunks = (await engine.chat.completions.create({
    //         ...request,
    //         stream: true,
    //     } as webllm.ChatCompletionRequest)) as AsyncIterable<webllm.ChatCompletionChunk>;

    //     let streamText = "";
    //     for await (let chunk of chunks) {
    //         console.log(JSON.stringify(chunk, null, "  "));
    //         if (chunk.choices[0]?.delta) {
    //             let content = chunk.choices[0]?.delta.content;
    //             if (typeof content === "string") {
    //                 streamText += content;
    //                 console.log(streamText);
    //             }
    //         }
    //         if (chunk.choices[0]?.delta?.tool_calls) {
    //             console.log(chunk);
    //         }
    //     }
    // }

    // let diffText = await readFileContent({ path });

    // console.log(diffText);

    // let item = await parseDiff(diffText);
    // console.log(item);

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
