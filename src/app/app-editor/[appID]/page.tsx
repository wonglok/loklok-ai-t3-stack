"use client";

import { MyFile, useGenAI } from "./useGenAI";
import { useEffect } from "react";
import { ControlPanel } from "./ui/components/ControlPanel";
import { WebGPUGate } from "./ui/components/WebGPUGate";
import { appsCode } from "./ui/llmCalls/common/appsCode";
// import { WebLLMAppClient } from "./ui/util/WebLLMAppClient";

export default function Page({ params }: { params: any }) {
    let appID = useGenAI((r) => r.appID);

    useEffect(() => {
        params.then(async (query: Record<string, any>) => {
            useGenAI.setState({
                appID: query.appID,
            });

            if (typeof window !== "undefined") {
                let files = (await appsCode.getItem(query.appID)) as MyFile[];

                if (files instanceof Array) {
                    useGenAI.setState({
                        files: files,
                    });
                }
            }
        });
    }, [params]);

    return (
        <>
            <WebGPUGate>
                <>
                    <div className="flex h-full w-full items-center justify-center lg:hidden">
                        Please open on Chrome WideScreen PC / Mac / iPad
                    </div>
                    <div className="hidden h-full w-full lg:flex">
                        <ControlPanel></ControlPanel>
                    </div>
                </>
            </WebGPUGate>
        </>
    );
}

//

//

//
