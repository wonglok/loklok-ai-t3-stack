import { refreshEngineSlot } from "../../refreshEngines";

export let makeTicker = ({ engineSettingData, displayName }) => {
    let symbols = [`✨`, "🤩", "⭐️", "❤️", "💙", "💛", "💖", "😍", "🥰"];
    let cursor = 0;

    return {
        tick: () => {
            cursor += 1;

            cursor = cursor % symbols.length;

            engineSettingData.bannerText = `${displayName} ${symbols[cursor]}`;

            refreshEngineSlot(engineSettingData);
        },
    };
};
