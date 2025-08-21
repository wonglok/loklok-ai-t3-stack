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

- Memorise the "product requirement definition", identify React Component modules and implement them in this format, use only javascript ".js" files:
- DO NOT WRAP THE CODE WITH markdown
- ONLY WRITE PURE CODE FOR {file_1_code} etc
- the folder for components is at "/components/*"
- use named export for "App" Component like the following: 
export function App () {...}

- include the following lines:
import * as React from 'react';

- write the App component to "/components/App.js"
- write the other components to "/components/*.js"


- format please follow this:
<x-mydearloklokcode file="{file_1_name}">
{file_1_code}
<x-mydearloklokcode>
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

    let divDoc = document.createElement("div");
    divDoc.innerHTML = text;

    let allCodes = divDoc.querySelectorAll("x-mydearloklokcode");

    for (let i = 0; i < allCodes.length; i++) {
        let path = allCodes[i].attributes[0]?.value;
        let content = allCodes[i].innerHTML;

        if (path.startsWith("/")) {
        } else {
            path = `/${path}`;
        }

        await writeFileContent({
            path: `${path}`,
            content: content,
        });
    }

    // console.log(await response.object);

    await saveToBrowserDB();

    MyTaskManager.doneTask("createReactAppRoot");

    await putBackFreeAIAsync({ engine: slot });
}
