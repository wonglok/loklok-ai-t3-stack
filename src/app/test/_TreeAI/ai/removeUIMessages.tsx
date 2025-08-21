import { UIMessage } from "ai";
import { useTreeAI } from "../state/useTreeAI";

export const removeUIMessages = (uiMessage: UIMessage) => {
    let uiMessages = useTreeAI.getState().uiMessages;
    useTreeAI.setState({
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
