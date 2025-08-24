import { useAI } from "../state/useAI";
import { LokLokSDK } from "../web/LokLokSDK";
import nprogress from "nprogress";
let timer000;
export const saveToCloud = async () => {
    console.log("save-to-cloud");

    clearTimeout(timer000);
    timer000 = setTimeout(async () => {
        //
        const appID = useAI.getState().appID;
        const files = useAI.getState().files;

        let sdk = new LokLokSDK({ appID });
        let i = 0;
        for (let file of files) {
            nprogress.set(i / (files.length - 1));
            await sdk.setupPlatform({
                procedure: "setFS",
                input: {
                    path: file.path,
                    content: file.content || "",
                    summary: file.summary || "",
                },
            });
            i++;
        }
        nprogress.done();
    }, 1500);
};

//
