import { useTreeAI } from "../state/useTreeAI";

export const addUIMessage = (uiMessage) => {
    let uiMessages = useTreeAI.getState().uiMessages;

    uiMessages.push(uiMessage);

    useTreeAI.setState({
        uiMessages: JSON.parse(JSON.stringify(uiMessages)),
    });
};
