"use client";

import { useEffect, useState } from "react";
import { useAI } from "../state/useAI";
import { v4 } from "uuid";

export function ViewAI({}) {
    let files = useAI((r) => r.files);
    let engines = useAI((r) => r.engines);
    let [appFiles, setFiles] = useState([]);

    useEffect(() => {
        setFiles(files);
    }, [
        files.map((r) => r.path).join("-"),
        engines.map((r) => `${r.status}${r.modelName}`).join("-"),
    ]);
    let appID = useAI((r) => r.appID);

    return (
        <>
            {appID && appFiles?.length > 0 && (
                <CoreRunner appID={appID} files={appFiles}></CoreRunner>
            )}
        </>
    );
}

export function CoreRunner({ appID, files }) {
    let [key, reload] = useState(`${v4()}`);

    useEffect(() => {
        useAI.setState({
            reloadFunc: () => {
                reload(`${v4()}`);
            },
        });
    }, []);

    return (
        <>
            <div className="h-full w-full">
                <div className="mb-3 w-full p-3" style={{ height: `50px` }}>
                    <div className="flex justify-end rounded-lg bg-gray-100 p-3">
                        <button
                            className="rounded-2xl bg-green-500 p-2 px-4 text-white"
                            onClick={() => {
                                reload(`${v4()}`);
                            }}
                        >
                            Refresh
                        </button>
                    </div>
                </div>
                <div
                    className="w-full pt-3"
                    style={{ height: `calc(100% - 50px - 12px)` }}
                >
                    <div className="h-full w-full">
                        <div className="h-full w-full bg-white p-3">
                            <iframe
                                key={key}
                                className="h-full w-full rounded-lg border bg-gradient-to-tr from-white to-gray-300"
                                src={`/apps/${appID}/run`}
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>

            {/*  */}
        </>
    );
}
