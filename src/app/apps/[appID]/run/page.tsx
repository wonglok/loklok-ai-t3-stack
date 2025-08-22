"use client";

import { useEffect, useState } from "react";
import { LokLokSDK } from "@/app/test/_TreeAI/web/LokLokSDK";
import { useParams } from "next/navigation";
import { rollupCode } from "@/app/test/_TreeAI/web/rollupCode";
import { RuntimeCore } from "@/app/test/_TreeAI/web/RuntimeCore";
import { LokRuntimeCore } from "./_run/LokRuntimeCore";

export default function WebRuntime() {
    let { appID } = useParams();
    let [compiled, setCompiled] = useState([]);
    useEffect(() => {
        if (!appID) {
            return;
        }
        let sdk = new LokLokSDK({ appID: appID });
        sdk.setupPlatform({
            procedure: "getFiles",
            input: {
                //
            },
        }).then((files) => {
            console.log("appID", appID);
            console.log("getFiles", files);

            rollupCode({
                files: [
                    ...files,

                    {
                        path: `/src/MyApp.js`,
                        content: /* js */ `
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
                        setApp(<div className="w-full h-full from-orange-100 to-yellow-300 bg-gradient-to-t flex items-center justify-center">Pr111eview Box</div>)
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
import { MyApp } from '../src/MyApp.js'
import * as ReactDOM from 'react-dom'
import * as React from 'react'


let ttt = setInterval(() => {
    let domElement = document.querySelector('#run_code_div')

    if (domElement) {
        clearInterval(ttt)
        if (!domElement?.root) {
            domElement.root = ReactDOM.createRoot(domElement)
        }
        domElement.root.render(<MyApp></MyApp>)
    }
}, 0);
`,
                    },
                ],
            })
                .then((fileArray) => {
                    setCompiled(fileArray);
                })
                .catch((e) => {
                    console.log("front end build failed...");
                    console.error(e);
                });
        });
    }, [appID]);

    console.log(compiled);

    return (
        <>
            {compiled.length > 0 && appID && (
                <LokRuntimeCore
                    appID={appID as string}
                    files={compiled}
                ></LokRuntimeCore>
            )}
        </>
    );
}
