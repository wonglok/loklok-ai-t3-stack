'use client'

import { useEffect, useState } from "react";

export const useFilesFrame = ({
    files = [

        {
            path: `/entry/main.js`,
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

}) => {
    let [frame, setFrame] = useState("");

    useEffect(() => {
        if (files.length === 0) {
            return
        }

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

                    // console.log(url.href);
                    setFrame(url.href);
                }
            });
        });
    }, [files.map(r => r.content + r.path).join('_')])

    return {
        show: <>
            {frame && <iframe className="w-full h-full" src={frame}></iframe>}
        </>
    }
}