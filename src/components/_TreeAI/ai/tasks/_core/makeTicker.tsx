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

    let start = performance.now();
    return {
        tick: (text) => {
            cursor += 1;
            let now = performance.now();
            let duration = now - start;

            cursor = cursor % symbols.length;

            engineSettingData.bannerText = `${displayName} ${symbols[cursor]} ${(text.split(" ").length / (duration / 1000)).toFixed(1)} token/s`;

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
