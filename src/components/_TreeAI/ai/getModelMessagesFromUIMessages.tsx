import { convertToModelMessages } from "ai";
import { useAI } from "../state/useAI";

export const getModelMessagesFromUIMessages = () => {
    let uiMessages = useAI.getState().uiMessages;

    uiMessages = uiMessages.filter((r) => {
        if (r.parts.some((r) => r.type.startsWith("data-"))) {
            return false;
        }
        return true;
    });

    uiMessages = uiMessages.filter((r) => {
        if (r.parts.some((r) => r.type.startsWith("data-code"))) {
            return false;
        }
        return true;
    });

    uiMessages = uiMessages.filter((r) => {
        if (r.parts.some((r) => r.type.startsWith("data-welcome"))) {
            return false;
        }
        return true;
    });

    uiMessages = uiMessages.filter((r) => {
        if (r.parts.some((r) => r.type.startsWith("reasoning"))) {
            return false;
        }
        return true;
    });

    let msg = convertToModelMessages(uiMessages);

    console.log(msg);

    return msg;
};
