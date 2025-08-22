"use client";

import { useEffect, useState } from "react";
import { useWebView } from "../web/useWebView";
import { useAI } from "../state/useAI";

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

    return <CoreRunner files={appFiles}></CoreRunner>;
}

export function CoreRunner({ files }) {
    let { show } = useWebView({
        runPage: "/test/run",
        files: [
            ...files,
            {
                path: `/src/App.js`,
                content: `
import * as ReactDOM from 'react-dom'
import * as React from 'react'
import { Canvas } from '@react-three/fiber'
import { Sphere, MeshTransmissionMaterial, Environment, OrbitControls } from '@react-three/drei'
// import { useSDK } from '@/ui/useSDK.js'
import { useState } from 'react'

export function MyApp () {  

    let [output, setOutput] = useState('')

    let [outlet, setApp] = React.useState(null)

    React.useEffect(() => {
        import('/components/App.tsx').then((myModule) =>{
                console.log('myModule', myModule)
                if (myModule?.App) {
                    try {
                        setApp(<myModule.App></myModule.App>)
                    } catch (e) {
                        console.log(e)
                    }
                } else {
                    try {
                        setApp(<div className="w-full h-full from-orange-100 to-yellow-300 bg-gradient-to-t flex items-center justify-center">Preview Box</div>)
                    } catch (e) {
                        console.log(e)
                    }
                }
            }).catch((e) => {
                console.log(e)
            })
    }, [])

    return <div className="w-full h-full relative">
        {outlet}
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


let ttt = setInterval(() => {
    let domElement = document.querySelector('#run_code_div')

    if (domElement) {
        clearInterval(ttt)
        if (!domElement?.root) {
            domElement.root = ReactDOM.createRoot(domElement)
            domElement.root.render(<MyApp></MyApp>)
        }
    }
}, 0);

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
