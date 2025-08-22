"use client";

import { useEffect, useState } from "react";
import { LokLokSDK } from "@/app/test/_TreeAI/web/LokLokSDK";
import { useParams } from "next/navigation";
import { useWebView } from "@/app/test/_TreeAI/web/useWebView";

//. src/app/apps/[appID]/sim/page.tsx

export default function WebRuntime() {
    let [files, setState] = useState([]);

    let { appID } = useParams();

    console.log("appID", appID);
    useEffect(() => {
        if (!appID) {
            return;
        }
        console.log("appID", appID);
        let sdk = new LokLokSDK({ appID: appID });
        sdk.setupPlatform({
            procedure: "getFiles",
            input: {},
        }).then((files) => {
            console.log("getFiles", files);
            setState(files);
        });
    }, [appID]);

    return (
        <>
            {files.length > 0 && appID && (
                <CoreRunner appID={appID} files={files}></CoreRunner>
            )}
        </>
    );
}

function CoreRunner({ files, appID }) {
    let { show } = useWebView({
        runPage: `/apps/${appID}/sim`,
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
            <div className="h-full w-full">{show}</div>

            {/*  */}
        </>
    );
}
