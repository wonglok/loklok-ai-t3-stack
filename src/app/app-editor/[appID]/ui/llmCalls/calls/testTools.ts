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
import { WebLLMAppClient } from "../../util/WebLLMAppClient";
import path from "path";
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
                        successfulRead: z
                            .boolean()
                            .describe("read is successful"),
                    })
                    .required({
                        successfulRead: true,
                        content: true,
                    }),
                execute: async ({ pathname }) => {
                    let content = await readFileContent({ path: pathname });
                    return {
                        successfulRead: true,
                        content: content,
                    };
                },
            },

            {
                name: "write_file",
                description: "save content to file at pathname",

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
                        successfulWrite: z
                            .boolean()
                            .describe("write is successfulWrite"),
                    })
                    .required({
                        successfulWrite: true,
                    }),
                execute: async ({ pathname, content }) => {
                    await writeToFile({
                        path: path.join(`/temp/function/`, pathname),
                        content,
                    });
                    return {
                        successfulWrite: true,
                    };
                },
            },
        ],
        extraSystemPrompt: `
${systemPromptDiffCode}
        `,
        engine: engine,
    });

    //

    await writeToFile({
        path: `/current-code.js`,
        content: `i love singing ppap`,
    });

    let messages = await sdk.run({
        messages: [
            {
                role: "assistant",
                content: `
Here is the content of "/current-code.js":
${await readFileContent({ path: `/current-code.js` })}
                `,
            },
            {
                role: "user",
                content: `
# Task

update "/current-code.js" file to the following:
i love singing worship songs now.

`,
            },
            {
                role: "user",
                content: `
# Output Requirements:
- MAKE SURE the line breaks are correct 
- MUST Generate "DIFF PATCH CODE" and then Save to "/diff.txt"
`,
            },
        ],
    });

    // messages = await sdk.run({
    //     messages: [
    //         ...messages,
    //         {
    //             role: "user",
    //             content: `
    //                 write "happy" to "happy.txt"
    //             `,
    //         },
    //     ],
    // });

    console.log(messages);

    console.log("inspect", sdk.messages);

    console.log(useGenAI.getState().files);

    let existingCode = await readFileContent({ path: "/current-code.js" });
    let diffCode = await readFileContent({ path: "/temp/diff.txt" });

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

    await new Promise((resolve) => {
        WebLLMAppClient.abortProcess();
        resolve(null);
    });
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
