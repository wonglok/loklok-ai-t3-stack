import { useAI } from "../state/useAI";

export const getUIMessages = () => {
    let uiMessages = useAI.getState().uiMessages;

    return uiMessages;
};
