import z from "zod";
import * as webllm from "@mlc-ai/web-llm";
import { JSONSchema } from "zod/v4/core";
import { useGenAI } from "../../../useGenAI";
import { writeToFile } from "../common/writeToFile";

type MyTool = {
    name: string;
    description: any;
    input: any;
    output: any;
    execute: any;
};

export class ToolFunctionSDK {
    public tools: MyTool[];
    public extraSystemPrompt: string;
    public engine: webllm.MLCEngineInterface;
    public needReset: boolean;
    public messages: webllm.ChatCompletionMessageParam[];
    constructor({
        tools = [],
        extraSystemPrompt = "",
        engine,
    }: {
        tools?: MyTool[];
        extraSystemPrompt?: string;
        engine: webllm.MLCEngineInterface;
    }) {
        this.extraSystemPrompt = extraSystemPrompt;
        this.tools = tools;
        this.engine = engine;
        this.engine.resetChat();

        this.messages = [
            { role: "system", content: `${this.getSystemPrompt()}` },
        ] as webllm.ChatCompletionMessageParam[];
    }

    extractFunctionArgsFromString(response: string) {
        let clean = `${response}`;

        clean = clean.replace("<function>", "");
        clean = clean.replace("</function>", "");
        clean = clean.trim();

        return clean;
    }
    jsonFromStr(v) {
        return JSON.parse(v);
    }
    destroy() {
        this.engine.resetChat();
    }

    async run({
        messages = [],
    }: {
        messages: webllm.ChatCompletionMessageParam[];
    }) {
        const seed = 0;
        // -------
        // -------
        // -------
        // -------
        // -------
        // 1. First request, expect to generate tool call to get temperature of Paris
        if (messages.length > 0) {
            this.messages.push(...messages);
        }

        const request: webllm.ChatCompletionRequest = {
            stream: false, // works with either streaming or non-streaming; code below assumes non-streaming
            messages: this.messages,
            seed: seed,
            max_tokens: 4096,
        };

        const reply = await this.engine.chat.completions.create(request);
        const response = reply.choices[0].message.content;

        console.log(reply.usage);
        console.log("Response 1: " + response);

        // write it down in the weather.txt
        this.messages.push({ role: "assistant", content: response });

        // <function>{"name": "get_current_temperature", "parameters": {"location": "Paris, France"}}</function>

        let argsStr = this.extractFunctionArgsFromString(response);
        let argsData = this.jsonFromStr(argsStr);

        console.log(argsData);

        let tool = this.tools.find((r) => r.name === argsData.name);

        let result = await tool.execute({
            ...tool.input.parse(argsData.parameters),
            _sdk: this,
        });
        let cleandValues = tool.output.parse(result);

        // -------
        // 2. Call function on your own to get tool response
        // -------
        const tool_response = JSON.stringify({
            output: JSON.stringify(cleandValues),
        });

        //
        this.messages.push({
            role: "tool",
            content: tool_response,
            tool_call_id: "0",
        });

        await writeToFile({
            path: "messages.json",
            content: `${JSON.stringify(this.messages, null, "\t")}`,
        });
    }

    getSystemPrompt() {
        let extraSystemPrompt = `${this.extraSystemPrompt}`;

        let functionHeaders = `${this.tools
            .map((t) => {
                return `Tool: ${t.description}\n`;
            })
            .join("\n")}`;

        let functionBodies = `${this.tools
            .map((t) => {
                return `${this.getToolSystemJSON(t)}`;
            })
            .join("\n")}`;

        return `
Cutting Knowledge Date: December 2023

# Tool Instructions
Here are the tools & functions avaibale:
${functionHeaders}

use relevant tools & functions if available.

You have access to the following functions:
${functionBodies}

If a you choose to call a function ONLY reply in the following format:
    <function>{"name": [function name], "parameters": [dictionary of argument name and its value] }</function>
Here is an example,
    <function>{ "name": "example_function_name", "parameters": {"example_name": "example_value"} }</function>
Reminder:
- Function calls MUST follow the specified format and use BOTH <function> and </function>
- Required parameters MUST be specified
- Only call one function at a time
- When calling a function, do NOT add any other words, ONLY the function calling
- Put the entire function call reply on one line
- Always add your sources when using search results to answer the user query

${
    extraSystemPrompt
        ? `
${extraSystemPrompt}
`
        : ``
}
`;
    }
    getToolSystemJSON({ name, description, input, output }: MyTool) {
        return JSON.stringify({
            type: "function",
            function: {
                name: name,
                description: description,
                parameters: z.toJSONSchema(input),
                return: z.toJSONSchema(output),
            },
        });
    }
}
