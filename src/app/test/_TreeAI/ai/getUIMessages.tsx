import { useTreeAI } from "../state/useTreeAI";

export const getUIMessages = () => {
    let uiMessages = useTreeAI.getState().uiMessages;

    return uiMessages;
};
