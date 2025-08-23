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
    let { show, reload } = useWebView({
        runPage: `/apps/${appID}/run`,
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

    useEffect(() => {
        useAI.setState({
            reloadFunc: () => {
                reload();
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
                                reload();
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
                        <div className="h-full w-full p-3">{show}</div>
                    </div>
                </div>
            </div>

            {/*  */}
        </>
    );
}
