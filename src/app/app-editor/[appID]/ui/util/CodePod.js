"use client";

import { useGenAI } from "../../useGenAI";
import { useFilesFrame } from "./useFilesFrame";

export function CodePod() {
    let files = useGenAI(r => r.files) || []

    console.log(files)

    let { show } = useFilesFrame({
        files: [
            {
                path: `/src/main.js`,
                content: /* javascript */ `
import { App } from '../src/App.js'
import * as ReactDOM from 'react-dom'
import * as React from 'react'

let domElement = document.querySelector('#run_code_div')

if (!domElement?.root) {
    domElement.root = ReactDOM.createRoot(domElement)
    domElement.root.render(<App></App>)
}

`,
            },
            {
                path: `/src/App.js`,
                content: /* javascript */ `
import * as ReactDOM from 'react-dom'
import * as React from 'react'
import { Canvas } from '@react-three/fiber'
import { Sphere, MeshTransmissionMaterial, Environment, OrbitControls } from '@react-three/drei'

export function App () {
    return <div className="w-full h-full">
        <Canvas className="w-full h-full relative">
            <Sphere>
                <MeshTransmissionMaterial color="white" thickness={1.1}></MeshTransmissionMaterial>
            </Sphere>
            <Environment preset="lobby" background></Environment>
            <OrbitControls></OrbitControls>
        </Canvas>

        <div className=" absolute top-0 left-0"></div>
    </div>
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
