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
import { addRelatedFiles } from "../prompts/addRelatedFiles";

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

    // ${await getAppOverviewPrompt()}

    let chatblocks = [];
    chatblocks.push({
        role: "assistant",
        content: `
        Here's the entire tech spec, but only focus on REACT JS Section and implement ReactJS:

        ${await readFileContent({
            path: `/docs/overall.md`,
        })}

        

        ${await readFileContent({
            path: `/docs/components.md`,
        })}

        - MUST implement all pages in Page Routes and Component Structure in App Router and also in MenuAfterLogin and MenuBeforeLogin accordingly
        `,
    });

    await listOutFilesToChatBlocks({ files, chatblocks });

    chatblocks.push({
        role: "user",
        content: `
# Instruction:

- Identify ALL React Component including user login register, landing page, and implement them in javascript format, use only javascript ".jsx" files:
- MUST write to the folder for components is at "/components/*"

# Requirements:

- MUST NOT WRAP THE CODE WITH markdown
- ONLY WRITE PURE CODE FOR {code} etc
- the folder for util is at "/util/*"

- MUST NOT USE '@/...' to import modules
- MUST USE '/...' to import modules

- use named export for "App" Component like the following: 
- MUST export reactjs components with default like: export default ... // good
- MUST import reactjs components with default like: import App from '/components/App.tsx' // bad

- include the following lines:
import * as React from 'react';

- when write the App component, write file to "/components/App.jsx"
- when write the other components, write file to "/components/*.jsx"

- use tailwind css to style the elements
- use some "border" "rounded-lg" together with "shadow-inner" but dont overuse them dear
- use some "p-3" padding spacing 

- MUST use zustand to implement backend interaction 
- MUST NOT use React.useState / useState
- MUST NOT use React.useState

- MUST use this line of code in App Component: import { HashRouter as Router, Route, Switch, Link, useHistory } from "react-router-dom";
- MUST use histroy.push('/about') to navigate: const history = useHistory(); // history.push('/about')

- MUST use hash link: <a href="#/register">Register</a>
- MUST NOT use url link: <a href="/register">Register</a>
- MUST NOT use a link within a link: <a href="/register">Register  <a href="/register">Register</a> </a> // bad practice


- MUST not: In HTML, <a> cannot be a descendant of <a>. This will cause a hydration error.

-------------------------
- MUST NOT DIRECTLY USE: 
await window.trpcSDK.client...
-------------------------

----- EXAMPLE /components/App.jsx -----
import { Router, Route, useLocation } from "react-router-dom";
import { useHashLocation } from "react-router-dom";

export default function App () {
    let [currnetLocation, setLocation] = useLocation();

    return <>
        <div>{...}</div> // top navigation menu .. and banner and etc

        <Router>
            <Switch>
                <Route exact path="/">
                    <HomePage />
                </Route>
                <Route path="/blog/:slug">
                    <BlogPost />
                </Route>
                // add more pages here....
            </Switch>
        </Router>
    </>
}
----- EXAMPLE /components/App.tsx -----


## References

${addRelatedFiles({ name: "/models", title: `please implement all data requirements in react components, here's the mongoose models:` })}
${addRelatedFiles({ name: "/trpc", title: `here's the backend procedures, please make sure front end has the error display slot and proper interatives.` })}
${addRelatedFiles({ name: "/store", title: `here's the zustand state store for user interfaces, please make sure interactions with backend are implmented` })}
${addRelatedFiles({ name: "/components", title: `here's the reactjs ui components.` })}


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

    let lastLength = -1;
    let parseText = async (text) => {
        try {
            const blocks = parseCodeBlocksGen3(`${text}`);

            if (lastLength !== blocks.length) {
                lastLength = blocks.length;

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

        parseText(text);

        ticker.tick(text);
    }
    parseText(text);

    await saveToBrowserDB();
    saveToCloud();
    ticker.remove();

    await MyTaskManager.doneTask(task.name);

    await putBackFreeAIAsync({ engine: slot });
}
