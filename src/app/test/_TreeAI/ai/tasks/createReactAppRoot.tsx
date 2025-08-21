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
import { IOTooling } from "../../io/IOTooling";
import { APP_ROOT_PATH, SPEC_DOC_PATH } from "../constants";
import { EngineSetting, useAI } from "../../state/useAI";
// import { refreshUIMessages } from "../refreshUIMessages";
// import { writeFileContent } from "../../io/writeFileContent";
// import { removeUIMessages } from "../removeUIMessages";
import { putBackFreeAIAsync } from "../putBackFreeAIAsync";
import { getFreeAIAsync } from "../getFreeAIAsync";
import { MyTask, MyTaskManager } from "./_core/MyTaskManager";
import { getModelMessagesFromUIMessages } from "../getModelMessagesFromUIMessages";
import { readFileContent } from "../../io/readFileContent";
import { writeFileContent } from "../../io/writeFileContent";
import { saveToBrowserDB } from "../../io/saveToBrowserDB";
import z from "zod";
import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";
import {
    LokLokParseError,
    parseCodeBlocks,
    parseMyDearLoklokCode,
} from "./_core/LokLokParser";

export async function createReactAppRoot({
    userPrompt,
    task,
}: {
    userPrompt: string;
    task: MyTask;
}) {
    let { model, slot } = await getFreeAIAsync();
    let files = useAI.getState().files;

    let info = [];

    let content = await readFileContent({ path: SPEC_DOC_PATH });
    if (content) {
        info.push({
            role: "user",
            content: `Here's the "product requirement definition": 
${content}`,
        });
    }

    if (files?.length > 0) {
        files.forEach((ff) => {
            info.push({
                role: "assistant",
                content: `
--------[file: ${ff.path}][begin]---------
${ff.content}
--------[file: ${ff.path}][end]---------
                `,
            });
        });
    }

    console.log("createReactAppRoot", content);

    let response = streamText({
        // schema: z
        //     .array(
        //         z
        //             .object({
        //                 path: z.string().describe("file path"),
        //                 code: z.string().describe("code"),
        //             })
        //             .describe("file info"),
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
            ...info,

            {
                role: "user",
                content: `
Instructions:

- Memorise the "product requirement definition", identify React Component modules and implement them in this format, use only typescript ".ts" files:
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

[mydearloklokcode file="{file_1_name}"]
{file_1_code}
[/mydearloklokcode]

[mydearloklokcode file="{file_2_name}"]
{file_2_code}
[/mydearloklokcode]

                `,
            },
            //
        ],
        model,
    });

    let text = "";
    for await (let part of response.textStream) {
        text += part;
        console.log(text);
    }

    try {
        const blocks = parseCodeBlocks(`${text}`);
        console.log("Parsed blocks:", JSON.stringify(blocks, null, 2));

        for (let block of blocks) {
            if (block.fileName.startsWith("/")) {
            } else {
                block.fileName = `/${block.fileName}`;
            }

            await writeFileContent({
                path: `${block.fileName}`,
                content: block.code,
            });
        }
    } catch (e) {
        if (e instanceof LokLokParseError) {
            console.error(`Parse error: ${e.message}`);
        } else {
            console.error(e);
        }
    }

    // for (let i = 0; i < allCodes.length; i++) {
    //     let path = allCodes[i].attributes[0]?.value;
    //     let content = allCodes[i].innerHTML;

    // }

    // console.log(await response.object);

    await saveToBrowserDB();

    MyTaskManager.doneTask("createReactAppRoot");

    await putBackFreeAIAsync({ engine: slot });
}
