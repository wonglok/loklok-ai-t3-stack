"use client";

// import { useGenAI } from "../../../useGenAI";
// import { writeToFile } from "../common/writeToFile";
import { useGenAI } from "../../../useGenAI";
import { ToolFunctionSDK } from "../app-tools/ToolFunctionSDK";
import z from "zod";
import { writeToFile } from "../common/writeToFile";
import { readFileContent } from "../common/readFileContent";
import { systemPromptDiffCode } from "../persona/systemPromptDiffCode";
// import type * as webllm from "@mlc-ai/web-llm";
import * as diffApply from "diff-apply";

declare global {
    interface Window {
        diffApply: typeof diffApply;
    }
}

if (typeof window !== "undefined") {
    window.diffApply = diffApply;
}

export async function testTools({ engine, userPrompt, slot }) {
    let sdk = new ToolFunctionSDK({
        tools: [
            {
                name: "read_file",
                description: "read content from file at pathName",

                input: z
                    .object({
                        pathName: z
                            .string()
                            .describe("The pathName of the file"),
                    })
                    .required({
                        pathName: true,
                    }),
                output: z
                    .object({
                        content: z.string().describe("The content of the file"),
                    })
                    .required({
                        content: true,
                    }),
                execute: async ({ pathName }) => {
                    let content = await readFileContent({ path: pathName });
                    return {
                        content: content,
                    };
                },
            },

            {
                name: "write_file",
                description: "write content to file at pathName",

                input: z
                    .object({
                        pathName: z
                            .string()
                            .describe("The pathName of the file"),
                        content: z.string().describe("The content of the file"),
                    })
                    .required({
                        pathName: true,
                    }),
                output: z
                    .object({
                        successful: z.boolean().describe("write is successful"),
                    })
                    .required({
                        successful: true,
                    }),
                execute: async ({ pathName, content }) => {
                    await writeToFile({ path: pathName, content });
                    return {
                        successful: true,
                    };
                },
            },

            {
                name: "write_output",
                description: "write output to file at pathName",

                input: z
                    .object({
                        pathName: z
                            .string()
                            .describe("The pathName of the file"),
                        content: z.string().describe("The content of the file"),
                    })
                    .required({
                        pathName: true,
                    }),
                output: z
                    .object({
                        successful: z.boolean().describe("write is successful"),
                    })
                    .required({
                        successful: true,
                    }),
                execute: async ({ pathName, content }) => {
                    await writeToFile({ path: pathName, content });
                    return {
                        successful: true,
                    };
                },
            },
        ],
        extraSystemPrompt: `
${systemPromptDiffCode}
        `,
        engine: engine,
    });

    await sdk.run({
        messages: [
            {
                role: "user",
                content: `
write: i love you Jesus in /hk1.txt
`,
            },
        ],
    });

    await sdk.run({
        messages: [
            {
                role: "user",
                content: `
write: i love you my Jesus my Abba Father and my Precious Sweet HolySpirit in /hk2.txt
`,
            },
        ],
    });

    await sdk.run({
        messages: [
            {
                role: "assistant",
                content: `here's /hk1.txt
${await readFileContent({ path: `/hk1.txt` })}
                `,
            },
            {
                role: "assistant",
                content: `here's /hk2.txt
${await readFileContent({ path: `/hk2.txt` })}
    `,
            },
            {
                role: "user",
                content: `
# instruction

I want to update /hk1.txt to /hk2.txt

`,
            },
            {
                role: "user",
                content: `
write output by generate diff code foramt and save it to /diff-hk3.txt
    `,
            },
        ],
    });

    //
    //

    console.log("inspect", sdk.messages);

    console.log(useGenAI.getState().files);

    let existingCode = await readFileContent({ path: "/hk1.txt" });
    let diffCode = await readFileContent({ path: "/diff.txt" });

    let strategy = diffApply.newUnifiedDiffStrategy.create(0.95);

    let diff = strategy.parseUnifiedDiff(diffCode);

    console.log(diff);

    let newCode = await strategy.applyDiff({
        originalContent: existingCode,
        diffContent: diffCode,
    });

    console.log(newCode);

    /*

    let strategy = diffApply.newUnifiedDiffStrategy.create(0.95);

    let diff = strategy.parseUnifiedDiff(`
    diff --git a/hk1.txt b/hk2.txt
new file mode 100644
index 0000000..e69de29bb2d1a4e26901ba7040642beee5a783e4
--- hk1.txt
+++ hk2.txt
@@ -1 +1 @@
-28.40719782134282 Degree
+30.002 Degree
    `);


    let allResults = (await strategy.applyDiff({
        //
        originalContent: `{"location":"Hong Kong, China","temperature":"28.40719782134282 Degree"}`,
        diffContent: `
    diff --git a/hk1.txt b/hk2.txt
new file mode 100644
index 0000000..e69de29bb2d1a4e26901ba7040642beee5a783e4
--- hk1.txt
+++ hk2.txt
@@ -1 +1 @@
-28.40719782134282 Degree
+30.002 Degree
    `,
    }));

    */

    // let allResults = (await strategy.applyDiff({
    //     //
    //     originalContent: `${existingCode}`,
    //     diffContent: `${diffCode.trim()}`,
    // })) as any;

    // console.log(allResults);

    // console.log(allResults);
    // for (let eachResult of allResults) {
    //     console.log(eachResult, eachResult.content);
    //     await WebLLMAppClient.writeToFile({
    //         path: eachResult.to,
    //         content: eachResult.content,
    //     });
    // }

    // let text = await readFileContent({ path: `/diff.txt` });

    // let parseDiff = await import("parse-diff").then(
    //     async ({ default: parseDiff }) => {
    //         return parseDiff;
    //     },
    // );

    // let diffList = await parseDiff(text);
    // console.log(diffList);

    await sdk.destroy();
}

//
/*
{

    let strategy = diffApply.newUnifiedDiffStrategy.create(0.95);

    let diff = strategy.parseUnifiedDiff(`
    diff --git a/hk1.txt b/hk2.txt
new file mode 100644
index 0000000..e69de29bb2d1a4e26901ba7040642beee5a783e4
--- hk1.txt
+++ hk2.txt
@@ -1 +1 @@
-28.40719782134282 Degree
+30.002 Degree
    `);

    console.log(diff)
}
*/
