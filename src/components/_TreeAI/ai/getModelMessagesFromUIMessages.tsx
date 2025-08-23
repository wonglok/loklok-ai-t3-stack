import { convertToModelMessages } from "ai";
import { useAI } from "../state/useAI";

export const getModelMessagesFromUIMessages = () => {
    let uiMessages = useAI.getState().uiMessages;

    uiMessages.filter((r) => {
        if (r.parts.some((r) => r.type.startsWith("data-"))) {
            return false;
        }
        return true;
    });

    return convertToModelMessages(uiMessages);
};
