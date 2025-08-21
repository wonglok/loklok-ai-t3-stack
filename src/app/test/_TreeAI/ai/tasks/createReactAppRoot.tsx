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

    console.log("createReactAppRoot", content);

    let response = await generateText({
        toolChoice: "required",
        tools: {
            ...IOTooling,
        },

        messages: [
            {
                role: "system",
                content: `
You are a developer.

You always use "write file" tool to write the genrated code into files accordinlg to each file.
                `,
            },
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
- Implement all the react js component in the "product requirement definition" above.
- please write to the react js component files to the /components/... folder

for example React Root App component:
export function App () {

    return <>
        ...
    </>
}

- Only output code, dont include markdown or text warpper

- make sure you write to the correct file:
- react js component file should be written at /components/... folder

                `,
            },
            //
        ],
        model,
    });

    console.log(JSON.stringify(response.toolResults));

    // let text = "";
    // for await (let part of response.textStream) {
    //     text += part;
    //     console.log(text);
    //     writeFileContent({ path: `${APP_ROOT_PATH}`, content: text });
    // }

    // await writeFileContent({ path: `${APP_ROOT_PATH}`, content: text });
    // await saveToBrowserDB();

    MyTaskManager.doneTask("createReactAppRoot");

    await putBackFreeAIAsync({ engine: slot });
}
