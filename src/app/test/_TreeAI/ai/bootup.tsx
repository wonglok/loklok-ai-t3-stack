import { useEffect } from "react";
import { loadFromBrowserDB } from "../io/loadFromBrowserDB";
import { useTreeAI } from "../state/useTreeAI";
// import { bootEngines } from "./bootEngines";

export const bootup = async () => {
    await loadFromBrowserDB();
};

export const SettingsBootUp = () => {
    useEffect(() => {
        useTreeAI.getState().engines[0].enabled = true;
        useTreeAI.getState().engines[1].enabled =
            localStorage.getItem("engine1") === "ok";
        useTreeAI.getState().engines[2].enabled =
            localStorage.getItem("engine2") === "ok";
        useTreeAI.getState().engines[3].enabled =
            localStorage.getItem("engine3") === "ok";
        useTreeAI.getState().engines[4].enabled =
            localStorage.getItem("engine4") === "ok";
        useTreeAI.getState().engines[5].enabled =
            localStorage.getItem("engine5") === "ok";
        useTreeAI.getState().engines[6].enabled =
            localStorage.getItem("engine6") === "ok";

        useTreeAI.setState({
            engines: [...useTreeAI.getState().engines],
        });

        return useTreeAI.subscribe((now, before) => {
            if (now.engines !== before.engines) {
                now.engines.forEach((engine, idx) => {
                    if (engine.enabled) {
                        localStorage.setItem(`engine${idx}`, "ok");
                    } else {
                        localStorage.setItem(`engine${idx}`, "bad");
                    }
                });
            }
        });
    }, []);

    return <></>;
};
