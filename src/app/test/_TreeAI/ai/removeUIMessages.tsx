import { UIMessage } from "ai";
import { useAI } from "../state/useAI";

export const removeUIMessages = (uiMessage: UIMessage) => {
    let uiMessages = useAI.getState().uiMessages;
    useAI.setState({
        uiMessages: JSON.parse(
            JSON.stringify(
                uiMessages.filter((msg) => {
                    if (uiMessage) {
                        if (uiMessage.id === msg.id) {
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                }),
            ),
        ),
    });
};
