import md5 from "md5";
import { EngineData, useGlobalAI } from "../../../useGlobalAI";

export const provideFreeEngineSlot = async ({
    name = "",
}: {
    name?: string;
}) => {
    let engine = await new Promise((resolve) => {
        let ttt = setInterval(() => {
            let engines = useGlobalAI.getState().engines;
            let foundSlot = engines.find((r) => r.lockedBy === "" && r.enabled);

            if (foundSlot) {
                let locker = `${name || `_${md5(`${Math.random()}`)}`}`;

                useGlobalAI.setState({
                    engines: JSON.parse(
                        JSON.stringify(
                            useGlobalAI.getState().engines.map((r) => {
                                if (r.name === foundSlot.name) {
                                    r.lockedBy = locker;
                                    return r;
                                }
                                return r;
                            }),
                        ),
                    ),
                });

                clearInterval(ttt);
                resolve(foundSlot);
            }
        }, 5);
    });

    return engine as EngineData;
};

export const returnFreeEngineSlot = async ({ slot }) => {
    useGlobalAI.setState({
        engines: JSON.parse(
            JSON.stringify(
                useGlobalAI.getState().engines.map((r) => {
                    if (r.name === slot.name) {
                        slot.lockedBy = "";
                        return slot;
                    }
                    return r;
                }),
            ),
        ),
    });

    //
};
