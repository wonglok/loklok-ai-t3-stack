"use client";
import { useAI } from "@/app/test/_TreeAI/state/useAI";
import { VercelLMStudio } from "@/app/test/_TreeAI/ui/VercelLMStudio";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
    let params = useParams();

    useEffect(() => {
        useAI.setState({
            appID: `${params.appID}`,
        });
    }, [params]);
    return (
        <>
            {params.appID && (
                <VercelLMStudio appID={params.appID as string}></VercelLMStudio>
            )}
        </>
    );
}
