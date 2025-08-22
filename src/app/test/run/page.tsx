"use client";
import { useAI } from "../_TreeAI/state/useAI";
import { RuntimeCore } from "../_TreeAI/web/RuntimeCore";

export default function Page() {
    let appID = useAI((r) => r.appID);

    return (
        <>
            <RuntimeCore appID={appID}></RuntimeCore>
        </>
    );
}
