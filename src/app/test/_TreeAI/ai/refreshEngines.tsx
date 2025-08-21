import { EngineSetting, useTreeAI } from "../state/useTreeAI";

export const refreshEngineSlot = (slot: EngineSetting) => {
    let engines = useTreeAI.getState().engines;
    useTreeAI.setState({
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
