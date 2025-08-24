import { useAI } from "../state/useAI";
import { LokLokSDK } from "../web/LokLokSDK";
import nprogress from "nprogress";

let timer000;
export const saveToCloud = async () => {
    await new Promise((resolve) => {
        clearTimeout(timer000);
        timer000 = setTimeout(async () => {
            //
            console.log("save-to-cloud");
            const appID = useAI.getState().appID;
            const files = useAI.getState().files;

            nprogress.start();
            let sdk = new LokLokSDK({ appID });
            let i = 0;
            for (let file of files) {
                await sdk.setupPlatform({
                    procedure: "setFS",
                    input: {
                        path: file.path,
                        content: file.content || "",
                        summary: file.summary || "",
                    },
                });
                nprogress.set(i / files.length);
                i++;
            }
            nprogress.done();
            resolve(null);
        }, 500);

        setTimeout(() => {
            resolve(null);
        }, 3 * 1000);
    });
};

//
