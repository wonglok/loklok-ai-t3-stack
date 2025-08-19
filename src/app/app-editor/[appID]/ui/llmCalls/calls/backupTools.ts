import type * as webllm from "@mlc-ai/web-llm";
import { useGenAI } from "../../../useGenAI";
import { writeToFile } from "../common/writeToFile";
import { ToolFunctionSDK } from "../app-tools/ToolFunctionSDK";
import z from "zod";

export async function testTools({ engine, userPrompt, slot }) {
    // Follows example, but tweaks the formatting with <function>
    const system_prompt = `Cutting Knowledge Date: December 2023

Today Date: 23 Jul 2024
# Tool Instructions
- When looking for real time information 
- read content from file at pathname use relevant functions if available
- write content from file at pathname use relevant functions if available

You have access to the following functions:

{
    "type": "function",
    "function": {
        "name": "get_current_temperature",
        "description": "Get the current temperature at a location.",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "The location to get the temperature for, in the format \"City, Country\""
                }
            },
            "required": [
                "location"
            ]
        },
        "return": {
            "type": "number",
            "description": "The current temperature at the specified location in the specified units, as a float."
        }
    }
}

{
    "type": "function",
    "function": {
        "name": "read_file_content",
        "description": "read content from file at pathname",
        "parameters": {
            "type": "object",
            "properties": {
                "pathname": {
                    "type": "string",
                    "description": "The pathname of the file"
                }
            },
            "required": [
                "pathname"
            ]
        },
        "return": {
            "type": "string",
            "description": "content of the file"
        }
    }
}

{
    "type": "function",
    "function": {
        "name": "write_file_content",
        "description": "write content to file at pathname",
        "parameters": {
            "type": "object",
            "properties": {
                "pathname": {
                    "type": "string",
                    "description": "The pathname of the file"
                },
                "content": {
                    "type": "string",
                    "description": "The content of the file"
                }
            },
            "required": [
                "pathname",
                "content"
            ]
        },
        "return": {
            "type": "boolean",
            "description": "successfull or not"
        }
    }
}
    
{
    "type": "function",
    "function": {
        "name": "send_message",
        "description": "Send a message to a recipient.",
        "parameters": {
            "type": "object",
            "properties": {
                "recipient": {
                    "type": "string",
                    "description": "Name of the recipient of the message"
                }
                "content": {
                    "type": "string",
                    "description": "Content of the message"
                }
            },
            "required": [
                "recipient",
                "content"
            ]
        },
        "return": {
            "type": "None"
        }
    }
}

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
You are a helpful Assistant.


`;

    // const selectedModel = "Llama-3.1-8B-Instruct-q4f16_1-MLC";
    // const engine: webllm.MLCEngineInterface = await webllm.CreateMLCEngine(
    //     selectedModel,
    //     { initProgressCallback: initProgressCallback, logLevel: "INFO" },
    // );
    let last = "";
    let dispalyText = async () => {
        let now = JSON.stringify(messages, null, "\t");
        if (last !== now) {
            await writeToFile({
                content: now,
                path: "messages.json",
            });
            last = now;
        }
        // slot.llmStatus = `${JSON.stringify(messages, null, "\t")}`;
        // useGenAI.setState({
        //     engines: JSON.parse(
        //         JSON.stringify(
        //             useGenAI.getState().engines.map((engine) => {
        //                 if (engine.name === slot.name) {
        //                     return slot;
        //                 }
        //                 return engine;
        //             }),
        //         ),
        //     ),
        // });
    };

    setInterval(() => {
        dispalyText();
    }, 50);

    await engine.resetChat();

    const seed = 0;

    // -------
    // -------
    // -------
    // -------
    // -------
    // 1. First request, expect to generate tool call to get temperature of Paris

    const messages: webllm.ChatCompletionMessageParam[] = [
        { role: "system", content: system_prompt },
        {
            role: "user",
            content: "Hey, what's the temperature in Paris right now?",
        },
    ];
    const request1: webllm.ChatCompletionRequest = {
        stream: false, // works with either streaming or non-streaming; code below assumes non-streaming
        messages: messages,
        seed: seed,
    };
    const reply1 = await engine.chat.completions.create(request1);
    const response1 = reply1.choices[0].message.content;
    console.log(reply1.usage);
    console.log("Response 1: " + response1);

    // write it down in the weather.txt

    messages.push({ role: "assistant", content: response1 });

    // <function>{"name": "get_current_temperature", "parameters": {"location": "Paris, France"}}</function>

    // -------
    // -------
    // -------
    // -------
    // -------
    // -------
    // -------
    // 2. Call function on your own to get tool response
    // -------
    const tool_response = JSON.stringify({ output: 22.5 });

    //
    messages.push({ role: "tool", content: tool_response, tool_call_id: "0" });

    // -------
    // -------
    // -------
    // -------
    // -------
    // -------
    // // -------
    // 3. Get natural language response
    // -------

    const request2: webllm.ChatCompletionRequest = {
        stream: false, // works with either streaming or non-streaming; code below assumes non-streaming
        messages: messages,
        seed: seed,
    };
    const reply2 = await engine.chat.completions.create(request2);
    const response2 = reply2.choices[0].message.content;
    messages.push({ role: "assistant", content: response2 });

    console.log(reply2.usage);
    console.log("Response 2: " + response2);

    //
    // The current temperature in Paris is 22.5°C.

    // -------
    // -------
    // -------
    // -------
    // -------
    // -------
    // -------
    // 4. Make another request, expect model to call `send_message`
    // -------
    messages.push({
        role: "user",
        content: "Send a message to Tom to tell him this information.",
    });

    const request3: webllm.ChatCompletionRequest = {
        stream: false, // works with either streaming or non-streaming; code below assumes non-streaming
        messages: messages,
        seed: seed,
    };
    const reply3 = await engine.chat.completions.create(request3);
    const response3 = reply3.choices[0].message.content;
    messages.push({ role: "assistant", content: response3 });

    console.log(reply3.usage);
    console.log("Response 3: " + response3);
    // <function>{"name": "send_message", "parameters": {"recipient": "Tom", "content": "The current temperature in Paris is 22.5°C."}}</function>

    // -------
    // -------
    // -------
    // -------
    // -------
    // -------
    // 5. Call API, which has no return value, so simply prompt model again

    const tool_response2 = JSON.stringify({ output: "None" });

    messages.push({ role: "tool", content: tool_response2, tool_call_id: "1" });

    const request4: webllm.ChatCompletionRequest = {
        stream: false, // works with either streaming or non-streaming; code below assumes non-streaming
        messages: messages,
        seed: seed,
    };
    const reply4 = await engine.chat.completions.create(request4);
    const response4 = reply4.choices[0].message.content;
    console.log(reply4.usage);
    console.log("Response 4: " + response4);

    // The message has been sent to Tom.
}
