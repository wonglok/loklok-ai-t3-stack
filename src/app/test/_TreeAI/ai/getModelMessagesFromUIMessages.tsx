import { convertToModelMessages } from "ai";
import { useAI } from "../state/useAI";

export const getModelMessagesFromUIMessages = () => {
    let uiMessages = useAI.getState().uiMessages;

    return convertToModelMessages(uiMessages);
};
