"use client";
import { useAI } from "@/components/_TreeAI/state/useAI";
import { VercelLMStudio } from "@/components/_TreeAI/ui/VercelLMStudio";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
            <LMStudioGate>
                {params.appID && appID && (
                    <VercelLMStudio appID={appID as string}></VercelLMStudio>
                )}
            </LMStudioGate>
        </>
    );
}

function LMStudioGate({ children }) {
    let [show, setShow] = useState("loading");

    useEffect(() => {
        let run = async () => {
            let ok = await fetch(`http://localhost:1234`)
                .then((r) => r.ok)
                .catch((r) => false);

            if (ok) {
                setShow("ok");
            } else {
                setShow("bad");
            }
        };
        run();
    }, []);
    return (
        <>
            {show === "loading" && (
                <>
                    <>
                        <div className="flex h-full w-full items-center justify-center">{`Loading...`}</div>
                    </>
                </>
            )}
            {show === "ok" && children}
            {show === "bad" && (
                <>
                    <div className="flex h-full w-full items-center justify-center">
                        <div>
                            <div className="mb-3 text-center">{`You need to launch LM Studio API`}</div>
                            <div className="mb-4 text-center">
                                <Link
                                    target="_lmstudio"
                                    className="text-center text-blue-600 underline"
                                    href={`https://lmstudio.ai/docs/app/api/headless`}
                                >
                                    {`Docs: Start the API service`}
                                </Link>
                            </div>
                            <div className="flex justify-center">
                                <Link
                                    target="_lmstudio"
                                    className="text-center text-blue-600 underline"
                                    href={`/img/step1.png`}
                                >
                                    <img
                                        className="m-3 aspect-video h-36"
                                        src={`/img/step1.png`}
                                        alt=""
                                    ></img>
                                </Link>

                                <Link
                                    target="_lmstudio"
                                    className="text-center text-blue-600 underline"
                                    href={`/img/step2.png`}
                                >
                                    <img
                                        className="m-3 aspect-video h-36"
                                        src={`/img/step2.png`}
                                        alt=""
                                    ></img>
                                </Link>
                            </div>
                        </div>

                        {/*  */}
                    </div>
                </>
            )}
            {/*  */}
        </>
    );
}
