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
// import { getModelMessagesFromUIMessages } from "../../getModelMessagesFromUIMessages";
// import { readFileContent } from "../../../io/readFileContent";
// import { writeFileContent } from "../../../io/writeFileContent";
import { saveToBrowserDB } from "../../../io/saveToBrowserDB";
// import z from "zod";
// import { parseCodeBlocks } from "./_core/LokLokParser";
// import { parseCodeBlocksActionType } from "./_core/LokLokParser2";
// import { removeFile } from "../../../io/removeFile";
// import { parseCodeBlocksGen3 } from "../_core/LokLokParser3";
import { refreshEngineSlot } from "../../refreshEngines";
import { writeFileContent } from "@/components/_TreeAI/io/writeFileContent";
import { makeTicker } from "../_core/makeTicker";
import { getModelMessagesFromUIMessages } from "../../getModelMessagesFromUIMessages";
import { saveToCloud } from "@/components/_TreeAI/io/saveToCloud";
import { listOutFilesToChatBlocks } from "../prompts/listOutFilesToChatBlocks";
import { getFileOutputFormatting } from "../prompts/getFileOutputFormatting";
import { parseCodeBlocksGen3 } from "../_core/LokLokParser3";
import { removeFile } from "@/components/_TreeAI/io/removeFile";

export const name = "handleAppSpec";
export const displayName = "Features";
export async function handleAppSpec({
    userPrompt,
    task,
}: {
    userPrompt?: string;
    task: MyTask;
}) {
    let { model, engineSettingData } = await getFreeAIAsync();

    await saveToBrowserDB();

    engineSettingData.bannerText = ``;
    refreshEngineSlot(engineSettingData);

    let ticker = makeTicker({
        engineSettingData: engineSettingData,
        displayName: displayName,
    });

    let chatbox = [];

    // listOutFilesToChatBlocks({
    //     files: useAI.getState().files,
    //     chatblocks: chatbox,
    // });

    let response = streamText({
        system: `
    You are a technical startup founder with senior fullsack web development skill. You help user plan and develop the app.

    # think about these things:
    
    ## what are the pages of the app? 
    / - home page
    /about - about the app page
    /login - login page
    /register - register page
    /app - app's page
    ... more pages

    ## what are the top menu items before logged in
    - menu items 
    ## what are the top menu items after logged in
    - menu items

    ## how to use the app?
    - interactions?
    
    ## what data are essential to the app?
    - DB collections?
    
    ## NPM Libraries
    - react.js
    - @react-three/fiber for 3d app 
    - @react-three/drei for 3d addons
    - zustand for state management for React.js
    - react.js uses zustand stores
    - axios / fetch in es6
    - @trpc/client
    - @trpc/server
    - "wouter" for front end single page routing using hash-router
    - javascript
    - mongoose

    - MUST NOT use other library / framework / npm
    - MUST NOT use common.js style require or module.export

    ## Folders:
    - react.js UI Components are located at: "/components/*.tsx"
    - zustand.js stores are located at: "/store/*.ts"

    ## Deliverables and Output foramtting:
    ------ "Overall Section" ----- write to "/docs/overall.md"
    - User Requirement list 
        ... (no code, only describe)

    - NPM Libraries list
        ... (no code, only describe)
    
    ------ "Mongoose Model Section" ----- "/docs/models.md"
    - mongoose db collection table names for [/models/*.js]
        ... (no code, only describe)
    
    ------ "@trpc/server Section" ----- "/docs/trpc.md"
    - @trpc/server back end procedures names with mongoose collection names involved for [/trpc/*.js]
        - auth prcedures...
        - app related procedures...
        - mongoose db collection table names needed by each of the procedures from [/models/*.js]
        ... (no code, only describe)
    
    ------ "ZUSTAND & @trpc/client Section" -----  "/docs/store.md"
    - Zustand Store Attributes list name for [/store/*.js]
        auth states...
        app related states...
        ... (no code, only describe)
        
    - Zustand Store Methods with @trpc/client list name and input params { email: string, password: string }  for [/store/*.js]
        auth prcedures...
        app related procedures...
        ... (no code, only describe)
    
    ------ "REACT JS Section" ----- "/docs/components.md"
    - Top Navigation Menu items Before Login for [/component/MenuBeforeLogion.jsx] 
        Home, About, Login, Register ... 
        ... (no code, only describe)

    - Top Navigation Menu items After Login for [/component/MenuAfterLogin.jsx] 
        Dashboard, Home, App, and other app related pages..., Logout, About ...
        ... (no code, only describe)

    - Page route list for [/component/App.jsx] 
        / - home page
        /about - about the app page
        /login - login page
        /register - register page
        /app - app's page
        ... more pages
        ... (no code, only describe)

    - React UI Component names for [/component/*.js]
        App.jsx (Router + Menu)
        MenuBeforeLogin.jsx
        MenuAfterLogin.jsx
        About.jsx
        HomePage.jsx
        LoginPage.jsx
        LogoutPage.jsx
        RegisterPage.jsx
        AppPage.jsx
        ... (no code, only describe)
    
    - Redirect to pages after login or register

${await getFileOutputFormatting()}
            `,
        model: model,
        messages: [
            //
            ...chatbox,
            {
                role: "user",
                content:
                    "write the documentation based on the following chat records:",
            },
            ...getModelMessagesFromUIMessages(),
        ],
    });

    //
    // let lastFile = "";
    let parseText = async (text) => {
        try {
            const blocks = parseCodeBlocksGen3(`${text}`);

            for (let block of blocks) {
                if (block.action === "create-file") {
                    await writeFileContent({
                        summary: `${block.summary}`,
                        path: `${block.fileName}`,
                        content: block.code,
                    });
                    await saveToBrowserDB();
                } else if (block.action === "update-file") {
                    await writeFileContent({
                        summary: `${block.summary}`,
                        path: `${block.fileName}`,
                        content: block.code,
                    });
                    await saveToBrowserDB();
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
        // console.log(text);

        parseText(text);

        ticker.tick(text);
    }

    console.log("text", text);

    await writeFileContent({ path: `/docs/all.md`, content: text });
    await saveToBrowserDB();
    saveToCloud();

    ticker.remove();

    await MyTaskManager.doneTask(task.name);

    await putBackFreeAIAsync({ engine: engineSettingData });

    //
}
