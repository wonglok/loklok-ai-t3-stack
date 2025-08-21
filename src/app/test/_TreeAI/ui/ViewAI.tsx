"use client";

import { useEffect, useState } from "react";
import { useWebView } from "../web/useWebView";
import { useAI } from "../state/useAI";

export function ViewAI({}) {
    let files = useAI((r) => r.files);
    let [appFiles, setFiles] = useState([]);

    useEffect(() => {
        setFiles(files);
    }, [files.map((r) => r.path).join("-")]);

    return <CoreRunner appFiles={appFiles}></CoreRunner>;
}

function CoreRunner({ appFiles }) {
    let { show } = useWebView({
        runPage: "/test/run",
        files: [
            ...appFiles,
            {
                path: `/ui/useSDK.js`,
                content: `
import { create } from 'zustand'

export const useSDK = create((set, get) =>{
    return {
        //
        //
    }
})
                `,
            },
            {
                path: `/src/App.js`,
                content: `
import * as ReactDOM from 'react-dom'
import * as React from 'react'
import { Canvas } from '@react-three/fiber'
import { Sphere, MeshTransmissionMaterial, Environment, OrbitControls } from '@react-three/drei'
import { useSDK } from '/ui/useSDK.js'
import { useState } from 'react'

export function MyApp () {  

    let [output, setOutput] = useState('')

    let [ppap, setApp] = React.useState(null)

    React.useEffect(() => {
        let files = ${JSON.stringify(appFiles)};

        if (files.some((r) => { return r.name === '/components/App.js' })) {
            import('/components/App.js').then((myModule) =>{
                console.log('myModule', myModule)
                if (myModule?.App) {
                    try {
                        setApp(<>
                            123
                            <myModule.App></myModule.App>
                        </>)
                    } catch (e) {
                        console.log(e)
                    }
                }
            }).catch((e) => {
                console.log(e)
            })
        }
    }, [])

    return <div className="w-full h-full relative">
        {ppap}
    </div>
}
`,

                //  <Canvas className="w-full h-full">
                //             <Sphere>
                //                 <MeshTransmissionMaterial color="white" thickness={1.1}></MeshTransmissionMaterial>
                //             </Sphere>
                //             <Environment preset="lobby" background></Environment>
                //             <OrbitControls></OrbitControls>
                //         </Canvas>
            },
            {
                path: `/src/main.js`,
                content: /* typescript */ `
import { MyApp } from '../src/App.js'
import * as ReactDOM from 'react-dom'
import * as React from 'react'


let domElement = document.querySelector('#run_code_div')

if (!domElement?.root) {
    domElement.root = ReactDOM.createRoot(domElement)
    domElement.root.render(<MyApp></MyApp>)
}

`,
            },
        ],
    });

    return (
        <>
            {/*  */}
            <div className="h-full w-full p-3">{show}</div>

            {/*  */}
        </>
    );
}
