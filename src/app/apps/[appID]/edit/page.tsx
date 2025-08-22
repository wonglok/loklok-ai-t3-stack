"use client";
import { VercelLMStudio } from "@/app/test/_TreeAI/ui/VercelLMStudio";
import { useParams } from "next/navigation";

export default function Page() {
    let params = useParams();
    return (
        <>
            {params.appID && (
                <VercelLMStudio appID={params.appID as string}></VercelLMStudio>
            )}
        </>
    );
}
