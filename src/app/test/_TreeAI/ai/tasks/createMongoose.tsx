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
import { SPEC_DOC_PATH } from "../constants";
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

export async function createMongoose({
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

    console.log(content);

    await saveToBrowserDB();

    await putBackFreeAIAsync({ engine: slot });
}
