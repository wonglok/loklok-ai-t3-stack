import { v4 } from "uuid";
import { useAI } from "../state/useAI";
import { UIMessage } from "ai";
import { saveToBrowserDB } from "../io/saveToBrowserDB";

let tt;
export const putUIMessage = (msg: UIMessage) => {
    let uiMessages = useAI.getState().uiMessages;

    if (uiMessages.some((r) => r.id === msg.id)) {
        uiMessages = uiMessages.map((thisMsg) => {
            if (thisMsg.id === msg.id) {
                return { ...msg };
            }
            return thisMsg;
        });
    } else {
        uiMessages.push({
            ...msg,
        });
    }

    useAI.setState({
        uiMessages: JSON.parse(JSON.stringify(uiMessages)),
    });
};
