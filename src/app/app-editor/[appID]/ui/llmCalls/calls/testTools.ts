// import { useGenAI } from "../../../useGenAI";
// import { writeToFile } from "../common/writeToFile";
import { useGenAI } from "../../../useGenAI";
import { ToolFunctionSDK } from "../app-tools/ToolFunctionSDK";
import z from "zod";
import { writeToFile } from "../common/writeToFile";
import { readFileContent } from "../common/readFileContent";
import { systemPromptDiffCode } from "../persona/systemPromptDiffCode";
// import type * as webllm from "@mlc-ai/web-llm";

export async function testTools({ engine, userPrompt, slot }) {
    let sdk = new ToolFunctionSDK({
        tools: [
            {
                name: "get_current_temperature",
                description: "Get the current temperature at a location.",

                input: z
                    .object({
                        location: z
                            .string()
                            .describe(
                                'The location to get the temperature for, in the format "City, Country"',
                            ),
                    })
                    .required({
                        location: true,
                    }),
                output: z
                    .object({
                        location: z
                            .string()
                            .describe(
                                'The location to get the temperature for, in the format "City, Country"',
                            ),

                        temperature: z
                            .string()
                            .describe(
                                "The weather temperature of the location",
                            ),
                    })
                    .required({
                        temperature: true,
                    }),
                execute: ({ location }) => {
                    console.log(location);
                    return {
                        location: `${location}`,
                        temperature: "33.31230 degree",
                    };
                },
            },

            {
                name: "read_file",
                description: "read content from file at pathname",

                input: z
                    .object({
                        pathname: z
                            .string()
                            .describe("The pathname of the file"),
                    })
                    .required({
                        pathname: true,
                    }),
                output: z
                    .object({
                        content: z.string().describe("The content of the file"),
                    })
                    .required({
                        content: true,
                    }),
                execute: async ({ pathname }) => {
                    let content = await readFileContent({ path: pathname });
                    return {
                        content: content,
                    };
                },
            },

            {
                name: "write_file",
                description: "write content to file at pathname",

                input: z
                    .object({
                        pathname: z
                            .string()
                            .describe("The pathname of the file"),
                        content: z.string().describe("The content of the file"),
                    })
                    .required({
                        pathname: true,
                    }),
                output: z
                    .object({
                        successful: z.boolean().describe("write is successful"),
                    })
                    .required({
                        successful: true,
                    }),
                execute: async ({ pathname, content }) => {
                    await writeToFile({ path: pathname, content });
                    return {
                        successful: true,
                    };
                },
            },
        ],
        extraSystemPrompt: ``,
        engine: engine,
    });

    await sdk.run({
        messages: [
            {
                role: "user",
                content: `how today's temperatre in hong kong?`,
            },
        ],
    });

    console.log("inspect", sdk.messages);

    await sdk.run({
        messages: [
            {
                role: "user",
                content: `write down the temperature at /weather.txt`,
            },
        ],
    });

    console.log("inspect", sdk.messages);

    await sdk.run({
        messages: [
            {
                role: "assistant",
                content: `${systemPromptDiffCode}`,
            },
            {
                role: "user",
                content: `output diffcode only. write the last output in /diff.txt`,
            },
        ],
    });

    console.log("inspect", sdk.messages);

    console.log(useGenAI.getState().files);

    await sdk.destroy();
}
