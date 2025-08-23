import { useAI } from "../state/useAI";

export const addUIMessage = (uiMessage) => {
    let uiMessages = useAI.getState().uiMessages;

    uiMessages.push(uiMessage);

    useAI.setState({
        uiMessages: JSON.parse(JSON.stringify(uiMessages)),
    });
};
