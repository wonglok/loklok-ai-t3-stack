import { useEffect } from "react";
import { loadFromBrowserDB } from "../io/loadFromBrowserDB";
import { EngineSetting, useAI } from "../state/useAI";
import { createInstance } from "localforage";
import { LokLokSDK } from "../web/LokLokSDK";
// import { bootEngines } from "./bootEngines";

export const bootup = async ({ appID }) => {
    let sdk = new LokLokSDK({ appID });
    let files =
        (await sdk.publicRPC({
            procedure: "getFiles",
            input: {},
        })) || [];

    console.log(files);

    if (files instanceof Array) {
        useAI.setState({
            files: files,
        });
    } else {
        // await loadFromBrowserDB();
    }
};

export const SettingsBootUp = () => {
    let appID = useAI((r) => r.appID);

    useEffect(() => {
        if (!appID) {
            return;
        }

        let db = createInstance({
            name: `chatDB-${appID}`,
        });

        db.getItem("ui-message").then(async (msg) => {
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

        db.getItem("engine-settings").then((engSettting: EngineSetting[]) => {
            if (engSettting instanceof Array) {
                engSettting = engSettting.map((it) => {
                    it.status = "empty";
                    return it;
                });
                useAI.setState({
                    engines: engSettting,
                });
            }
        });
        return useAI.subscribe((now, before) => {
            if (now.engines !== before.engines) {
                db.setItem("engine-settings", now.engines);
            }
        });
    }, [appID]);

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

    return <></>;
};
