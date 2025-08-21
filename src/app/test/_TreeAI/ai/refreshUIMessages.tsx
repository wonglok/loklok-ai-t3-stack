import { UIMessage } from "ai";
import { useTreeAI } from "../state/useTreeAI";

export const refreshUIMessages = (uiMessage: UIMessage) => {
    let uiMessages = useTreeAI.getState().uiMessages;
    useTreeAI.setState({
        uiMessages: JSON.parse(
            JSON.stringify(
                uiMessages.map((msg) => {
                    if (uiMessage) {
                        if (uiMessage.id === msg.id) {
                            return uiMessage;
                        }
                    }
                    return msg;
                }),
            ),
        ),
    });
};
