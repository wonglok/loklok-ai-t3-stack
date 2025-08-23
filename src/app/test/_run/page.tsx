"use client";
import { useAI } from "../../../components/_TreeAI/state/useAI";
import { RuntimeCore } from "../../../components/_TreeAI/web/RuntimeCore";

export default function Page() {
    let appID = useAI((r) => r.appID);

    return (
        <>
            <RuntimeCore appID={appID}></RuntimeCore>
        </>
    );
}
