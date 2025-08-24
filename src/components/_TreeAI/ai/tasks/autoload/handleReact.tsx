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
import { getAppOverviewPrompt } from "../prompts/getAppOverviewPrompt";
import { getFileOutputFormatting } from "../prompts/getFileOutputFormatting";
import { putUIMessage } from "../../putUIMessage";
import { v4 } from "uuid";
import { refreshUIMessages } from "../../refreshUIMessages";
import { removeUIMessage } from "../../removeUIMessage";
import { listOutFilesToChatBlocks } from "../prompts/listOutFilesToChatBlocks";
import { makeTicker } from "../_core/makeTicker";
import { saveToCloud } from "@/components/_TreeAI/io/saveToCloud";

export const name = "handleReact";
export const displayName = "React.JS";

export async function handleReact({
    userPrompt,
    task,
}: {
    userPrompt: string;
    task: MyTask;
}) {
    let { model, engineSettingData: slot } = await getFreeAIAsync();
    let files = useAI.getState().files;

    let chatblocks = [];
    chatblocks.push({
        role: "system",
        content: `${await getAppOverviewPrompt()}`,
    });

    // await listOutFilesToChatBlocks({ files, chatblocks });

    chatblocks.push({
        role: "user",
        content: `
# React Component

- Identify React Component modules and implement them in this format, use only typescript ".ts" files:
- DO NOT WRAP THE CODE WITH markdown
- ONLY WRITE PURE CODE FOR {code} etc
- the folder for components is at "/components/*"
- the folder for util is at "/util/*"

- DO NOT USE '@/...' to import modules
- ALWAYS USE '/...' to import modules

- use named export for "App" Component like the following: 
export function App () {...}

- include the following lines:
import * as React from 'react';

- when write the App component, write file to "/components/App.tsx"
- when write the other components, write file to "/components/*.tsx"

- use tailwind css to style the elements
- use some "border" "rounded-lg" together with "shadow-inner" but dont overuse them dear
- use some "p-3" padding spacing 

- MUST always use zustand to implement backend interaction 
- MUST never use React.useState / useState
- MUST never use React.useState

- ALWAYS: import { useLocation } from 'wouter'; 
- NEVER: import { useNavigate } from 'wouter';

-------------------------
- NEVER DIRECTLY USE: 
await window.trpcSDK.runTRPC({
    procedure: '',
    input: {  }
});
-------------------------


----- EXAMPLE /components/App.tsx -----
import { Router, Route } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
// ...

export function App () {

    return <>
        <Router hook={useHashLocation}>
            
            /* ... add more code here ..
            examples:
                <Route path="/" component={LandingPage} />
                <Route path="/login" component={LoginPage} />
                <Route path="/register" component={RegisterPage} />
                // ....
                <Route path="/my-app" component={MyApp} />
            */
        </Router>
    </>
}
----- EXAMPLE /components/App.tsx -----

${files
    .filter((r) => r.path.startsWith("/store"))
    .map((r) => {
        return `
-------------------------------
FilePath: ${r.path}
Summary: ${r.summary}
Content: 
${r.content}
-------------------------------
    `;
    })}



# instruction
update suitable code files within "/components/*" to meet the latest requirements

use suitable zustand stores accordingly.

${await getFileOutputFormatting()}

                `,
    });

    // console.log("chatblocks", chatblocks);

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

    // let lastFile = "";
    let parseText = async (text) => {
        try {
            const blocks = parseCodeBlocksGen3(`${text}`);
            // console.log("Parsed blocks:", JSON.stringify(blocks, null, 2));

            for (let block of blocks) {
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

    let ticker = makeTicker({
        engineSettingData: slot,
        displayName: displayName,
    });

    let text = "";
    for await (let part of response.textStream) {
        text += part;
        // console.log(text);

        parseText(text);

        ticker.tick(text);

        //
    }
    parseText(text);

    await saveToBrowserDB();
    saveToCloud();
    ticker.remove();

    await MyTaskManager.doneTask(task.name);

    await putBackFreeAIAsync({ engine: slot });
}

/*

//

please write me a regex parser for typescript for the following code:


[TJ_TAG action="create-file" file="example1.ts" summary="test text"]
export function hello() {
    console.log("Hello, world!");
}
[/TJ_TAG]

[TJ_TAG action="remove-file" file="example1.ts" summary="test text"]
export function hello() {
    console.log("Hello, world!");
}
[/TJ_TAG]

[TJ_TAG action="update-file" file="example1.ts" summary="test text"]
export function hello() {
    console.log("Hello, world!");
}
[/TJ_TAG]


*/
