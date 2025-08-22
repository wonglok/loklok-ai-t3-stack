"use client";

import { useAI } from "@/app/test/_TreeAI/state/useAI";
import { RuntimeCore } from "@/app/test/_TreeAI/web/RuntimeCore";
// "use client";

// import { LokLokSDK } from "@/app/test/_TreeAI/web/LokLokSDK";
// import { RuntimeCore } from "@/app/test/_TreeAI/web/RuntimeCore";
// import { useParams } from "next/navigation";
// import { useEffect, useState } from "react";

// export default function Page() {
//     let [files, setState] = useState([]);

//     let { appID } = useParams();

//     useEffect(() => {
//         if (!appID) {
//             return;
//         }
//         console.log("appID", "myApp001", appID);
//         let sdk = new LokLokSDK({ appID: appID });
//         sdk.setupPlatform({
//             procedure: "getFiles",
//             input: {},
//         }).then((files) => {
//             console.log("getFiles", files);
//             setState(files);
//         });
//     }, [appID]);

//     return <>{/*  */}</>;
// }

export default function Page() {
    let appID = useAI((r) => r.appID);

    return (
        <>
            <RuntimeCore appID={appID}></RuntimeCore>
        </>
    );
}
