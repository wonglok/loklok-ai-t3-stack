"use client";

import { useGlobalAI } from "../../useGlobalAI";
import { useFilesFrame } from "./useFilesFrame";

export function CodePod() {
    let files = useGlobalAI(r => r.files) || []

    let { show } = useFilesFrame({
        files: [
            ...files,
            {
                path: `/ui/useSDK.js`,
                content: /* javascript */ `
import { create } from 'zustand'

export const useSDK = create((set, get) =>{
    return {
    }
})
                `,
            },
            {
                path: `/src/App.js`,
                content: /* javascript */ `
import * as ReactDOM from 'react-dom'
import * as React from 'react'
import { Canvas } from '@react-three/fiber'
import { Sphere, MeshTransmissionMaterial, Environment, OrbitControls } from '@react-three/drei'
import { useSDK } from '/ui/useSDK.js'

export function MyApp () {

    let [App, setApp] = React.useState(null)

    React.useEffect(() => {
        import('/app-engine/App.js').then((props) =>{
            if (props?.App) {
                try {
                    setApp(<props.App></props.App>)
                } catch (e) {

                }
            }
        }).catch((e) => {
            console.log(e)
        })
    }, [])



    return <div className="w-full h-full relative">
        <Canvas className="w-full h-full ">
            <Sphere>
                <MeshTransmissionMaterial color="white" thickness={1.1}></MeshTransmissionMaterial>
            </Sphere>
            <Environment preset="lobby" background></Environment>
            <OrbitControls></OrbitControls>
        </Canvas>

        <div className=" absolute top-0 left-0 z-100">
            {App}
        </div>
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
