'use client'

import { useEffect, useRef, useState } from "react";

export const useFilesFrame = ({
    // Default Code
    // Default Code
    // Default Code
    // Default Code
    files = [

        {
            path: `/src/main.js`,
            content: /* javascript */ `
                import * as lok from '../src/lok.js'
                import ReactDOM from 'react-dom'
                
                document.querySelector('#run_code_div').innerText = '' + Math.random() + lok.yo
    
                console.log('running my code content')
            `,
        },
        {
            path: `/src/lok.js`,
            content: /* javascript */ `
                export const yo = 'loklok'
            `,
        },
    ]
    // Default Code
    // Default Code
    // Default Code
    // Default Code
}) => {
    let [frame, setFrame] = useState("");
    let refTimer = useRef(-5000)

    useEffect(() => {
        if (files.length === 0) {
            return
        }
        let run = () => {
            import("./buildCode").then(({ buildCode }) => {
                buildCode({
                    files: files,
                }).then((fileArray) => {
                    //

                    console.log(fileArray);

                    let url = new URL(`${location.origin}/app-editor/running`);

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
                }).catch((e) => {
                    console.log('front end build failed...')
                    console.error(e)
                });
            });
        }

        if (refTimer.current === -5000) {
            run()
        }

        // @ts-ignore
        clearTimeout(refTimer.current)
        // @ts-ignore
        refTimer.current = setTimeout(() => {
            //
            run()
            //
        }, 500)
    }, [files.map(r => r.content + r.path).join('_')])

    return {
        show: <>
            {frame && <iframe className="w-full h-full" src={frame}></iframe>}
        </>
    }
}