import {
    convertToModelMessages,
    streamText,
    tool,
    createUIMessageStream,
    UIMessage,
} from "ai";
import { z } from "zod";
import { useTreeAI } from "../state/useTreeAI";
import { getUIMessages } from "./getUIMessages";
import { bootEngines } from "./bootEngines";
import { getFreeAIAsync } from "./getFreeAIAsync";
import { addUIMessage } from "./addUIMessage";
import { refreshUIMessages } from "./refreshUIMessages";
import { SPEC_DOC_PATH } from "./constants";
import { refreshEngineSlot } from "./refreshEngines";
import { IOTooling } from "../io/IOTooling";
import { writeFileContent } from "../io/writeFileContent";
import { putBackFreeAIAsync } from "./putBackFreeAIAsync";
import { saveToBrowserDB } from "../io/saveToBrowserDB";
import { readFileContent } from "../io/readFileContent";
import { removeUIMessages } from "./removeUIMessages";

export const streamAppBuild = async () => {
    await bootEngines();

    let { model, slot } = await getFreeAIAsync();

    slot.bannerText = `🧑🏻‍💻 ${SPEC_DOC_PATH}`;
    refreshEngineSlot(slot);

    // console.log(slot);

    let userPrompt = useTreeAI.getState().userPrompt;

    useTreeAI.setState({
        userPrompt: "",
    });

    let content = await readFileContent({ path: SPEC_DOC_PATH });

    //

    // await putBackFreeAIAsync({ engine: slot });
};
