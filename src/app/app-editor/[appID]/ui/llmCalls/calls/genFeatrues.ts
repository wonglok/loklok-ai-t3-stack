"use client";

import type * as webllm from "@mlc-ai/web-llm";
import { systemPromptPureText } from "../persona/systemPromptPureText";
import { llmRequestToFileStream } from "../common/llmRequestToFileStream";

export const genFeatrues = async ({ slot, userPrompt, engine }) => {
    ///////////////////////////////////////////////////////////////////////////////////
    // manifest
    ///////////////////////////////////////////////////////////////////////////////////
    let messages: webllm.ChatCompletionMessageParam[] = [
        {
            role: `system`,
            content: `
Instruction
You are a senior product manager tasked with reviewing the provided user requirements 
and drafting a clear, concise product requirements definition (PRD) for a software system. 
Incorporate design thinking principles and draw inspiration from biblical proverbs to infuse wisdom into the system's feature design, emphasizing clarity, empathy, and user-centric solutions.
You Organize the content in a clear, structured, and professional manner.
Use precise, polished, and professional language to enhance readability and clarity.

Format Requirements:
Use markdown for formatting.
Apply consistent indentation for hierarchy and readability.
Avoid using double asterisks (**) or bold text in markdown.
Include a blank line between each new item for better spacing.
Adhere strictly to the output format provided below.

Please output the following:
1. Type of Users of the App
2. For Each Type of User: List out their pages involved
3. For Each Type of User: List out their interaction procedures
4. For any missed screens also list them for eaxmple: login, register, etc...


`,
        },
        {
            role: "user",
            content: `here's the "user-requirements.txt"
    ${userPrompt}`,
        },

        {
            role: "user",
            content: `

Please read about "user-requirements.txt" and rewrite it accroding to system prompt.


            `,
        },
    ];

    const request: webllm.ChatCompletionRequestStreaming = {
        seed: 19900831,
        stream: true,
        stream_options: { include_usage: true },
        messages: messages,
        temperature: 0,
    };

    let path = `/docs/genFeatrues.md`;

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
