import { EngineSetting, useAI } from "../state/useAI";

export const refreshEngineSlot = (slot: EngineSetting) => {
    let engines = useAI.getState().engines;
    useAI.setState({
        engines: JSON.parse(
            JSON.stringify(
                engines.map((entry) => {
                    if (slot) {
                        if (slot.name === entry.name) {
                            return { ...slot };
                        }
                    }
                    return entry;
                }),
            ),
        ),
    });
};
