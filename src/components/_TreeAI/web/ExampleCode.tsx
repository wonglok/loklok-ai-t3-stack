"use client";

import { useEffect, useState } from "react";
import { MyFile, useAI } from "../state/useAI";
import { useWebView } from "./useWebView";

export function WebRuntime() {
    let files = useAI((r) => r.files) || [];
    let [myFiles, setState] = useState([]);

    useEffect(() => {
        setState(files);
    }, [files.map((r) => r.path).join("-")]);

    return <Runner myFiles={myFiles}></Runner>;
}

function Runner({ myFiles }) {
    let { show } = useWebView({
        files: [
            ...myFiles,
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

export function MyApp () {

    let [App, setApp] = React.useState(null)

    React.useEffect(() => {
        let files = ${JSON.stringify(myFiles)};

        if (files.some((r) => { return r.name === '/component/App.js' })) {
            import('/component/App.js').then((myModule) =>{
                console.log('myModule', myModule)
                if (myModule?.App) {
                    try {
                        setApp(<myModule.App></myModule.App>)
                    } catch (e) {

                    }
                }
            }).catch((e) => {
                console.log(e)
            })
        }
    }, [])

    return <div className="w-full h-full relative">
        <Canvas className="w-full h-full ">
            <Sphere>
                <MeshTransmissionMaterial color="white" thickness={1.1}></MeshTransmissionMaterial>
            </Sphere>
            <Environment preset="lobby" background></Environment>
            <OrbitControls></OrbitControls>
        </Canvas> 
    </div>
}
`,
            },
            {
                path: `/src/main.js`,
                content: /* javascript */ `
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

            {show}

            {/*  */}
        </>
    );
}
