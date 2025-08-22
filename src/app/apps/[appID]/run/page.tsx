"use client";

import { useEffect, useState } from "react";
import { LokLokSDK } from "@/app/test/_TreeAI/web/LokLokSDK";
import { useParams } from "next/navigation";
import { CoreRunner } from "@/app/test/_TreeAI/ui/ViewAI";

export default function WebRuntime() {
    let [myFiles, setState] = useState([]);

    let { appID } = useParams();
    useEffect(() => {
        if (!appID) {
            return;
        }

        let sdk = new LokLokSDK({ appID: appID });
        sdk.setupPlatform({
            procedure: "getFiles",
            input: {},
        }).then((files) => {
            console.log(files);
            setState(files);
        });
    }, [appID]);

    return (
        <>
            {myFiles.length > 0 && <CoreRunner appFiles={myFiles}></CoreRunner>}
        </>
    );
}
