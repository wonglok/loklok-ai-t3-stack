import {
    convertToModelMessages,
    createUIMessageStream,
    generateObject,
    generateText,
    ModelMessage,
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

    let response = await generateObject({
        schema: z.array(
            z.object({
                filepath: z.string(),
                filecontent: z.string(),
            }),
        ),
        // toolChoice: "required",
        // tools: {
        //     ...IOTooling,
        // },

        messages: [
            {
                role: "system",
                content: `
You are a developer.

You always use write file tool to write the genrated code into files accordinlg to each file.
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
Instructions:

- only implement "/components/App.js" for the "product requirement definition":

export function App () {
    return <>
        ...
    </>
}

- Only output code, dont include markdown or text warpper

- Write files to the right file
                `,
            },
            //
        ],
        model,
    });

    console.log(response);

    // await writeFileContent({
    //     path: `${APP_ROOT_PATH}`,
    //     content: response.text,
    // });
    await saveToBrowserDB();

    MyTaskManager.doneTask("createReactAppRoot");

    await putBackFreeAIAsync({ engine: slot });
}
