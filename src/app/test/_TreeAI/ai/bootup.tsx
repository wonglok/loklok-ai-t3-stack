import { useEffect } from "react";
import { loadFromBrowserDB } from "../io/loadFromBrowserDB";
import { useAI } from "../state/useAI";
import { createInstance } from "localforage";
// import { bootEngines } from "./bootEngines";

export const bootup = async () => {
    await loadFromBrowserDB();
};

export const SettingsBootUp = () => {
    useEffect(() => {
        useAI.getState().engines[0].enabled = true;
        useAI.getState().engines[1].enabled =
            localStorage.getItem("engine1") === "ok";
        useAI.getState().engines[2].enabled =
            localStorage.getItem("engine2") === "ok";
        useAI.getState().engines[3].enabled =
            localStorage.getItem("engine3") === "ok";
        useAI.getState().engines[4].enabled =
            localStorage.getItem("engine4") === "ok";
        useAI.getState().engines[5].enabled =
            localStorage.getItem("engine5") === "ok";
        useAI.getState().engines[6].enabled =
            localStorage.getItem("engine6") === "ok";

        useAI.setState({
            engines: [...useAI.getState().engines],
        });

        return useAI.subscribe((now, before) => {
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

    let appID = useAI((r) => r.appID);

    useEffect(() => {
        if (!appID) {
            return;
        }

        let db = createInstance({
            name: `chatDB-${appID}`,
        });

        db.getItem("ui-message").then((msg) => {
            if (msg instanceof Array) {
                useAI.setState({
                    uiMessages: msg,
                });
            }
        });
        return useAI.subscribe((now, before) => {
            if (now.uiMessages !== before.uiMessages) {
                db.setItem("ui-message", now.uiMessages);
            }
        });
    }, [appID]);

    useEffect(() => {
        if (!appID) {
            return;
        }

        let db = createInstance({
            name: `engines-${appID}`,
        });

        db.getItem("engine-settings").then((msg) => {
            if (msg instanceof Array) {
                useAI.setState({
                    engines: msg,
                });
            }
        });
        return useAI.subscribe((now, before) => {
            if (now.engines !== before.engines) {
                db.setItem("engine-settings", now.engines);
            }
        });
    }, [appID]);

    return <></>;
};
