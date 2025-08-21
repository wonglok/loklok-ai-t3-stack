import { v4 } from "uuid";
import { useAI } from "../state/useAI";

export const putUIMessage = (uiMessage) => {
    let uiMessages = useAI.getState().uiMessages;

    if (uiMessages.some((r) => r.id === uiMessage.id)) {
        uiMessages = uiMessages.map((msg) => {
            if (msg.id === uiMessage.id) {
                return { ...uiMessage };
            }
            return msg;
        });
    } else {
        uiMessages.push({
            ...uiMessage,
            id: `${v4()}`,
        });
    }

    useAI.setState({
        uiMessages: JSON.parse(JSON.stringify(uiMessages)),
    });
};
