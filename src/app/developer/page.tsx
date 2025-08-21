"use client";

import { useWebView } from "../test/_TreeAI/web/useWebView";

export default function Page() {
    let { show } = useWebView({
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
        <Canvas className="w-full h-full">
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
