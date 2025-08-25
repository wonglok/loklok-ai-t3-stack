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

    await listOutFilesToChatBlocks({ files, chatblocks });

    chatblocks.push({
        role: "user",
        content: `
# React Component

- Identify ALL React Component modules (including user login register) and implement them in this format, use only typescript ".ts" files:
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
- MUST NOT use React.useState / useState
- MUST NOT use React.useState

- ALWAYS use: import { useLocation } from 'wouter'; 
- ALWAYS use: let [location,setLocation] = useLocation();

- MUST NOT use: import { useNavigate } from 'wouter';
- MUST NOT use: import { navigate } from "wouter/use-hash-location";

- MUST USE: import { Link } from "wouter"
- MUST USE: <Link href="/register">Register</Link>
- MUST NOT USE: <a href="/register">Register</a>

-------------------------
- MUST NOT DIRECTLY USE: 
await window.trpcSDK.runTRPC({
    procedure: '',
    input: {  }
});
-------------------------

----- EXAMPLE /components/App.tsx -----
import { Router, Route, Link } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
// ...

export function App () {

    return <>
        <div>{...}</div> // top navigation menu ..
        <Router hook={useHashLocation}>
            
            /* ... add more code here ..
            examples:
                <Route path="/" component={HomePage} />
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
Implement React Component by fullfilling the zustand store:
-------------------------------
File Path: ${r.path}
File Content:
${r.content}
-------------------------------
    `;
    })}



# instruction
update suitable reactjs code files to meet the latest requirements

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
