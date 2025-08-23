"use client";

import { useEffect, useRef, useState } from "react";

export const useWebView = ({
    // Default Code
    // Default Code
    // Default Code
    // Default Code
    runPage = "/test/run",
    files = [
        {
            path: `/src/main.js`,
            summary: "",
            content: /* javascript */ `
                import * as lok from '../src/lok.js'
                import ReactDOM from 'react-dom'
                
                document.querySelector('#run_code_div').innerText = '' + Math.random() + lok.yo
    
                console.log('running my code content')
            `,
        },
        {
            path: `/src/lok.js`,
            summary: "",
            content: /* javascript */ `
                export const yo = 'loklok'
            `,
        },
    ],
    // Default Code
    // Default Code
    // Default Code
    // Default Code
}) => {
    let [frame, setFrame] = useState("");
    let refTimer = useRef(-5000);

    let reload = () => {
        let frameOld = `${frame}`;
        setFrame("");
        setTimeout(() => {
            setFrame(frameOld);
        });
    };

    useEffect(() => {
        if (files.length === 0) {
            return;
        }
        let run = () => {
            import("./rollupCode").then(({ rollupCode }) => {
                rollupCode({
                    files: files,
                })
                    .then((fileArray) => {
                        //

                        console.log(fileArray);

                        let url = new URL(`${location.origin}${runPage}`);

                        if (!url.searchParams.has("blob")) {
                            url.searchParams.set(
                                "blob",
                                URL.createObjectURL(
                                    new Blob([JSON.stringify(fileArray)], {
                                        type: "application/javascript",
                                    }),
                                ),
                            );

                            setFrame(url.href);
                        }
                    })
                    .catch((e) => {
                        console.log("front end build failed...");
                        console.error(e);
                    });
            });
        };

        if (refTimer.current === -5000) {
            run();
        }

        // @ts-ignore
        clearTimeout(refTimer.current);
        // @ts-ignore
        refTimer.current = setTimeout(() => {
            //
            run();
            //
        }, 500);
        let save = () => {
            run();
        };
        window.addEventListener("save-editor", save);

        return () => {
            window.removeEventListener("save-editor", save);
        };
    }, [files.map((r) => r.content + r.summary + r.path).join("_")]);

    return {
        reload: reload,
        show: (
            <>
                {frame && (
                    <iframe
                        className="h-full w-full rounded-lg border bg-gradient-to-tr from-white to-gray-300"
                        src={frame}
                    ></iframe>
                )}
            </>
        ),
    };
};
