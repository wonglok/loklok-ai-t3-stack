import { UIMessage } from "ai";
import { useAI } from "../state/useAI";

export const refreshUIMessages = (uiMessage?: UIMessage) => {
    let uiMessages = useAI.getState().uiMessages;
    useAI.setState({
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
