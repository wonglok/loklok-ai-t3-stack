import { v4 } from "uuid";
import { refreshEngineSlot } from "../../refreshEngines";
import { putUIMessage } from "../../putUIMessage";
import { UIMessage } from "ai";
// import { removeUIMessage } from "../../removeUIMessage";

export let makeTicker = ({ engineSettingData, displayName }) => {
    let symbols = [`✨`, "🤩", "⭐️", "❤️", "💙", "💛", "💖", "😍", "🥰"];
    let cursor1 = 0;
    let cursor2 = 0;

    let uiMsg = {
        id: `${v4()}`,
        role: "assistant",
        parts: [
            {
                type: "data-text",
                data: `Loading...`, // text
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
            cursor1 += 1;
            cursor1 = cursor1 % symbols.length;
            cursor2 -= 1;
            cursor2 = Math.abs(cursor1 % symbols.length);

            engineSettingData.bannerText = ` ${symbols[cursor1]} ${displayName} ${symbols[cursor2]}`;
            uiMsg.parts[0].data = text;

            putUIMessage(uiMsg as UIMessage);
            refreshEngineSlot(engineSettingData);
        },

        remove: () => {
            engineSettingData.bannerText = "";
            refreshEngineSlot(engineSettingData);

            uiMsg.parts[0].data = `Finished: ${displayName}`;
            putUIMessage(uiMsg as UIMessage);

            // removeUIMessage(uiMsg as UIMessage);
        },
    };
};

//
