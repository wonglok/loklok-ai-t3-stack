import { useAI } from "../state/useAI";
import { LokLokSDK } from "../web/LokLokSDK";

let timer000;
export const saveToCloud = async () => {
    //
    const appID = useAI.getState().appID;
    const files = useAI.getState().files;

    console.log("save-to-cloud");

    clearTimeout(timer000);
    timer000 = setTimeout(async () => {
        let sdk = new LokLokSDK({ appID });
        for (let file of files) {
            await sdk.setupPlatform({
                procedure: "setFS",
                input: {
                    path: file.path,
                    content: file.content || "",
                    summary: file.summary || "",
                },
            });
        }
    }, 1500);
};

//
