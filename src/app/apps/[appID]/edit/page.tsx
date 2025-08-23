"use client";
import { useAI } from "@/components/_TreeAI/state/useAI";
import { VercelLMStudio } from "@/components/_TreeAI/ui/VercelLMStudio";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
    let params = useParams();
    let appID = useAI((r) => r.appID);
    useEffect(() => {
        useAI.setState({
            appID: `${params.appID}`,
        });
    }, [params]);
    return (
        <>
            {params.appID && appID && (
                <VercelLMStudio appID={appID as string}></VercelLMStudio>
            )}
        </>
    );
}
