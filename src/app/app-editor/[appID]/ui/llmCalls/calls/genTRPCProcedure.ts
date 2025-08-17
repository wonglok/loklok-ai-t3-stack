"use client";

import type * as webllm from "@mlc-ai/web-llm";
import { systemPromptPureText } from "../persona/systemPromptPureText";
import { llmRequestToFileStream } from "../common/llmRequestToFileStream";

export const genTRPCProcedure = async ({
    slot,
    userPrompt,
    reactComponentsText,
    engine,
}) => {
    ///////////////////////////////////////////////////////////////////////////////////
    // manifest
    ///////////////////////////////////////////////////////////////////////////////////
    let messages: webllm.ChatCompletionMessageParam[] = [
        {
            role: `system`,
            content: `${systemPromptPureText}`,
        },
        {
            role: "assistant",
            content: `here's the "user-requirements" Document:
${userPrompt}`,
        },

        {
            role: "assistant",
            content: `here's the "React UI Components" Document:
${reactComponentsText}`,
        },

        {
            role: "assistant",
            content: `

# Output in Pure Text Format
    
    ## Backend tRPC Procedures: 

        Procedures:
            * Each Procedure
                - CallName: [api.post.procedureName]
            * Each Procedure
                - CallName: [api.post.procedureName]
            [...]
`,
        },

        {
            role: "user",
            content: `
Please write procedures needed by the React Components:
`,
        },

        /*





## Backend Database:

        Mongoise Database:
            * Each Collection
                - CollectionTitle: [...]
                - Description: [...]
                - DataFields: 
                    * DataField 
                        - Name: [...]
                        - DataType: [mongoose compatible data type]
            * Each Collection
                - CollectionTitle: [...]
                - Description: [...]
                - DataFields: 
                    * DataField 
                        - Name: [...]
                        - DataType: [mongoose compatible data type]

## Front End tRPC SDK
[...]

## Zustand State Management
[...]


             */
    ];

    const request: webllm.ChatCompletionRequestStreaming = {
        seed: 19900831,
        stream: true,
        stream_options: { include_usage: true },
        messages: messages,
        temperature: 0,
    };

    let path = `/docs/genTRPCProcedure.md`;

    await llmRequestToFileStream({
        path: path,
        request: request,
        engine,
        slot: slot,
    });

    ///////////////////////////////////////////////////////////////////////////////////
    // usecase
    ///////////////////////////////////////////////////////////////////////////////////
};
