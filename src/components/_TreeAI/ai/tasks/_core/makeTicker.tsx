import { v4 } from "uuid";
import { refreshEngineSlot } from "../../refreshEngines";
import { putUIMessage } from "../../putUIMessage";
import { UIMessage } from "ai";
import { removeUIMessage } from "../../removeUIMessage";

export let makeTicker = ({ engineSettingData, displayName }) => {
    let symbols = [`✨`, "🤩", "⭐️", "❤️", "💙", "💛", "💖", "😍", "🥰"];
    let cursor = 0;

    let uiMsg = {
        id: `${v4()}`,
        role: "assistant",
        parts: [
            {
                type: "data-codeedit",
                data: ``, // text
            },
            // {
            //     type: "data-codeedit-btn",
            //     data: ``, // path
            // },
            //data-codeedit
        ],
    };
    putUIMessage(uiMsg as UIMessage);

    return {
        tick: (text) => {
            cursor += 1;

            cursor = cursor % symbols.length;

            engineSettingData.bannerText = ` ${symbols[cursor]} ${displayName} ${symbols[cursor]}`;

            uiMsg.parts[0].data = text;

            putUIMessage(uiMsg as UIMessage);

            refreshEngineSlot(engineSettingData);
        },

        remove: () => {
            removeUIMessage(uiMsg as UIMessage);
        },
    };
};

//
