import {
    convertToModelMessages,
    createUIMessageStream,
    generateObject,
    generateText,
    ModelMessage,
    streamObject,
    streamText,
    tool,
    UIMessage,
} from "ai";
import { IOTooling } from "../../../io/IOTooling";
import { APP_ROOT_PATH, SPEC_DOC_PATH } from "../../constants";
import { EngineSetting, useAI } from "../../../state/useAI";
// import { refreshUIMessages } from "../refreshUIMessages";
// import { writeFileContent } from "../../io/writeFileContent";
// import { removeUIMessages } from "../removeUIMessages";
import { putBackFreeAIAsync } from "../../putBackFreeAIAsync";
import { getFreeAIAsync } from "../../getFreeAIAsync";
import { MyTask, MyTaskManager } from "../_core/MyTaskManager";
import { getModelMessagesFromUIMessages } from "../../getModelMessagesFromUIMessages";
import { readFileContent } from "../../../io/readFileContent";
import { writeFileContent } from "../../../io/writeFileContent";
import { saveToBrowserDB } from "../../../io/saveToBrowserDB";
// import z from "zod";
// import { parseCodeBlocks } from "./_core/LokLokParser";
// import { parseCodeBlocksActionType } from "./_core/LokLokParser2";
import { removeFile } from "../../../io/removeFile";
import { parseCodeBlocksGen3 } from "../_core/LokLokParser3";

export const name = "handleReactAppRoot";
export async function handleReactAppRoot({
    userPrompt,
    task,
}: {
    userPrompt: string;
    task: MyTask;
}) {
    let { model, engineSettingData: slot } = await getFreeAIAsync();
    let files = useAI.getState().files;

    let chatblocks = [];

    let content = await readFileContent({ path: SPEC_DOC_PATH });
    console.log("content", content);
    if (!!content) {
        chatblocks.push({
            role: "user",
            content: `Here's the "product requirement definition": 
${content}
`,
        });
    }

    if (files?.length > 0) {
        chatblocks.push({
            role: "user",
            content: `Here's the "file system of existing code": 
${content}`,
        });

        files.forEach((ff) => {
            chatblocks.push({
                role: "assistant",
                content: `
[file: "${ff.path}"][begin]
    [file: "${ff.path}"][summary_start]
${ff.summary}
    [file: "${ff.path}"][summary_end]
    [file: "${ff.path}"][content_start]
${ff.content}
    [file: "${ff.path}"][content_end]
[file: "${ff.path}"][end]`,
            });
        });
    }

    chatblocks.push({
        role: "user",
        content: `
Instructions:

${!!content ? `- Memorise the "product requirement definition" and refer to it when you implement the react code` : ``}

- Identify React Component modules and implement them in this format, use only typescript ".ts" files:
- use tailwind css to style the elements
- DO NOT WRAP THE CODE WITH markdown
- ONLY WRITE PURE CODE FOR {file_1_code} etc
- the folder for components is at "/components/*"

- use named export for "App" Component like the following: 
export function App () {...}

- include the following lines:
import * as React from 'react';

- when write the App component, write file to "/components/App.tsx"
- when write the other components, write file to "/components/*.tsx"

- for formatting follow this:
- if you want to create file
[mydearlokloktag action="create-file" file="{file_path_name}" summary="{file_summary}"]
{code}
[/mydearlokloktag]

- if you want to remove file
[mydearlokloktag action="remove-file" file="{file_path_name}" summary="{file_summary}"][/mydearlokloktag]

- if you want to update file
[mydearlokloktag action="update-file" file="{file_path_name}" summary="{file_summary}"]
{code}
[/mydearlokloktag]

- {file_path_name} is the file path name
- {file_summary} is the overview, purpose and summary of the code file
- {code} is the code of the file

- use some rounded-lg 
- use some shadow-inner 
- use some border for shadow-inner items

- if there is an existing file, then you can use [mydearlokloktag action="update-file" ...]
- if there is no existing file, then you can [mydearlokloktag action="create-file" ...]
- if you need to remove existing file, then you can [mydearlokloktag action="remove-file" ...]

                `,
    });

    console.log("handleReactAppRoot", chatblocks);

    let response = streamText({
        // schema: z
        //     .array(
        //         z
        //             .object({
        //                 path: z.string().describe("file path"),
        //                 code: z.string().describe("code"),
        //             })
        //             .describe("file chatblocks"),
        //     )
        //     .describe("list of files and its content"),
        // schemaName: "file outputs",
        // schemaDescription: "a list of files to be written to file system",
        // toolChoice: "required",
        // tools: {
        //     ...IOTooling,
        // },

        messages: [
            //             {
            //                 role: "system",
            //                 content: `
            // You are a developer you are good at writing json.
            //                 `,
            //             },
            ...getModelMessagesFromUIMessages(),
            //
            ...chatblocks,

            //
        ],
        model,
    });

    //

    let parseText = async (text) => {
        try {
            const blocks = parseCodeBlocksGen3(`${text}`);
            console.log("Parsed blocks:", JSON.stringify(blocks, null, 2));

            for (let block of blocks) {
                if (block.fileName.startsWith("/")) {
                } else {
                    block.fileName = `/${block.fileName}`;
                }

                if (block.action === "create-file") {
                    await writeFileContent({
                        summary: `${block.summary}`,
                        path: `${block.fileName}`,
                        content: block.code,
                    });
                } else if (block.action === "update-file") {
                    await writeFileContent({
                        summary: `${block.summary}`,
                        path: `${block.fileName}`,
                        content: block.code,
                    });
                } else if (block.action === "remove-file") {
                    await removeFile({
                        path: `${block.fileName}`,
                    });
                } else {
                }
            }
        } catch (e) {
            if (e instanceof Error) {
                console.error(`Parse error: ${e.message}`);
            } else {
                console.error(e);
            }
        }
    };

    let text = "";
    for await (let part of response.textStream) {
        text += part;
        console.log(text);

        parseText(text);

        //

        //
    }
    parseText(text);

    await saveToBrowserDB();

    await MyTaskManager.doneTask(task.name);

    await putBackFreeAIAsync({ engine: slot });
}

/*

//

please write me a regex parser for typescript for the following code:


[mydearlokloktag action="create-file" file="example1.ts" summary="test text"]
export function hello() {
    console.log("Hello, world!");
}
[/mydearlokloktag]

[mydearlokloktag action="remove-file" file="example1.ts" summary="test text"]
export function hello() {
    console.log("Hello, world!");
}
[/mydearlokloktag]

[mydearlokloktag action="update-file" file="example1.ts" summary="test text"]
export function hello() {
    console.log("Hello, world!");
}
[/mydearlokloktag]


*/
