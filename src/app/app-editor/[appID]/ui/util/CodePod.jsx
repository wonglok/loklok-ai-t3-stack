"use client";

import { useGenAI } from "../../useGenAI";
import { useFilesFrameHook } from "./useFilesFrameHook";

export function CodePod() {
    let files = useGenAI(r => r.files) || []

    let { show } = useFilesFrameHook({
        files: [
            ...files,
            {
                path: `/ui/useSDK.js`,
                content: /* typescript */ `
import { create } from 'zustand'

export const useSDK = create((set, get) =>{
    return {
        //
    }
})
                `,
            },
            {
                path: `/src/App.js`,
                content: /* typescript */ `
import * as ReactDOM from 'react-dom'
import * as React from 'react'
import { Canvas } from '@react-three/fiber'
import { Sphere, MeshTransmissionMaterial, Environment, OrbitControls } from '@react-three/drei'
import { useSDK } from '/ui/useSDK.js'

export function MyApp () {

    let [App, setApp] = React.useState(null)

    React.useEffect(() => {
        import('/entry/App.js').then((variable) =>{
            console.log('variable', variable)
            if (variable?.App) {
                try {
                    setApp(<variable.App></variable.App>)
                } catch (e) {

                }
            }
        }).catch((e) => {
            console.log(e)
        })
    }, [])

    return <div className="w-full h-full relative">
        {/* <Canvas className="w-full h-full ">
            <Sphere>
                <MeshTransmissionMaterial color="white" thickness={1.1}></MeshTransmissionMaterial>
            </Sphere>
            <Environment preset="lobby" background></Environment>
            <OrbitControls></OrbitControls>
        </Canvas> */}
        {/* absolute top-0 left-0 z-100 */}
        <div className="ppap">
            {App}
        </div>
    </div>
}
`,
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

            {show}

            {/*  */}
        </>
    );
}
