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
            content: `${systemPromptPureText}`,
        },
        {
            role: "user",
            content: `here's the "user-requirements.txt"
    ${userPrompt}`,
        },

        {
            role: "user",
            content: `
# Instruction
You are a senior product manager:
Review the current "user requirements" and write a new "product requirement definition"

## Design Thinking Requirements:
    1. Oragnise the text in a neat and tidy way
    2. rewrite wordings to better english
    3. ponder bible proverbs scriptures for wisidom when designing the system, 
    4. learn from the wisdom of single source of truth, constant values, pure functions

## Format Requirements
    1. Use markdown
    3. Use indentation
    4. NEVER Wrap text with ** in markdown
    5. NEVER USE ** in markdown
    5. NEVER Bold Text in markdown
    6. Always add a new line for each new item (better spacing...)
    7. Must follow the Output format below:
`,
        },

        {
            role: "assistant",
            content: `

# Output in Pure Text Format
    
    ## UserRoles and Features Section

        UserRoles:
            * UserRole
                name: [...]
                Features:
                    - [number]
                        Title: [...]
                        Description: [...]
                        Navigation Steps: 
                            - [number]
                                PageRoute & Params: [...]
                                Interaction Steps: 
                                    - [number]: [...]
                                    - [number]: [...]
                                    - [number]: [...]
                            - [number]
                                PageRoute & Params: [...]
                                InterInteraction Steps: 
                                    - [number]: [...]
                                    - [number]: [...]
                                    - [number]: [...]
                            - [number]
                                PageRoute & Params: [...]
                                InterInteraction Steps: 
                                    - [number]: [...]
                                    - [number]: [...]
                                    - [number]: [...]
            * UserRole
                name: [...]
                Features:
                    - [number]
                        Title: [...]
                        Description: [...]
                        Navigation Steps: 
                            - [number]
                                PageRoute & Params: [...]
                                Interaction Steps: 
                                    - [number]: [...]
                                    - [number]: [...]
                                    - [number]: [...]
                            - [number]
                                PageRoute & Params: [...]
                                InterInteraction Steps: 
                                    - [number]: [...]
                                    - [number]: [...]
                                    - [number]: [...]
                            - [number]
                                PageRoute & Params: [...]
                                InterInteraction Steps: 
                                    - [number]: [...]
                                    - [number]: [...]
                                    - [number]: [...]




`,
        },
        {
            role: "user",
            content: `
Please compelte the section: "UserRoles and Features Section"
            `,
        },

        /*


    ## Front End Pages and UI Components:

        Pages:
            * Each Web Page 
                - PageRoute & Params: [...]
                - PageDescription: [...]

                * Each ReactJS Component 
                    - Name : [Name]
                    - description: [description]
                    - Sub-Components: 
                        ...
                        * Each ReactJS Component 
                            - Name : [Name]
                            - description: [description]
                            - Sub-Components:  
                                ...
                                * Each ReactJS Component 
                                    - Name : [Name]
                                    - description: [description]
                        ...
                        * Each ReactJS Component 
                            - Name : [Name]
                            - description: [description]
                            - Sub-Components:  
                                ...
                                * Each ReactJS Component 
                                    - Name : [Name]
                                    - description: [description]


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

    ## Backend tRPC Procedures (Similar to REST Endpoints): 

        Procedures:
        
            * Each Procedure
                - Title: [...]
                - Description: [...]
                - Input Parameters: [...]
                - Output Parameters: [...]

            * Each Procedure
                - Title: [...]
                - Description: [...]
                - Input Parameters: [...]
                - Output Parameters: [...]

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
