import {
    convertToModelMessages,
    createUIMessageStream,
    generateText,
    ModelMessage,
    streamText,
    tool,
    UIMessage,
} from "ai";
import { addUIMessage } from "../addUIMessage";
import { getUIMessages } from "../getUIMessages";
import z from "zod";
import { IOTooling } from "../../io/IOTooling";
import { APP_ROOT_PATH, SPEC_DOC_PATH } from "../constants";
import { EngineSetting, useAI } from "../../state/useAI";
// import { refreshUIMessages } from "../refreshUIMessages";
// import { writeFileContent } from "../../io/writeFileContent";
// import { removeUIMessages } from "../removeUIMessages";
import { saveToBrowserDB } from "../../io/saveToBrowserDB";
import { putBackFreeAIAsync } from "../putBackFreeAIAsync";
import { getFreeAIAsync } from "../getFreeAIAsync";
import { MyTask, MyTaskManager } from "./_core/MyTaskManager";
import { getModelMessagesFromUIMessages } from "../getModelMessagesFromUIMessages";
import md5 from "md5";
import { putUIMessage } from "../putUIMessage";
import { updateCamera } from "@react-three/fiber/dist/declarations/src/core/utils";
import { refreshEngineSlot } from "../refreshEngines";
import { readFileContent } from "../../io/readFileContent";
import { writeFileContent } from "../../io/writeFileContent";

export async function createReactApp({
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

    console.log("createReactApp", content);

    let response = streamText({
        messages: [
            ...getModelMessagesFromUIMessages(),
            //
            {
                role: "user",
                content: `Here's the "product requirement definition": 
${content}`,
            },

            {
                role: "user",
                content: `
Write ReactJS Component "/components/App.tsx" according to the "product requirement definition" above.

- Implement the "App" javascript function, according to the "product requirement definition" above.

export function App () {

    return <>
        ...
    </>
}

- Only output code, dont include markdown or text warpper

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
        writeFileContent({ path: `${APP_ROOT_PATH}`, content: text });
    }

    await writeFileContent({ path: `${APP_ROOT_PATH}`, content: text });
    await saveToBrowserDB();

    MyTaskManager.doneTask("createReactApp");

    await putBackFreeAIAsync({ engine: slot });
}
