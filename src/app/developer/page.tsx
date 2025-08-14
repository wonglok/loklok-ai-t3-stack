"use client";

import { useFilesFrame } from "../app-editor/[appID]/ui/util/useFilesFrame";

export default function Page() {
    let { show } = useFilesFrame({
        files: [
            {
                path: `/entry/main.js`,
                content: /* javascript */ `
import * as lok from '../src/lok.js'
import * as ReactDOM from 'react-dom'
import * as React from 'react'
import { Canvas } from '@react-three/fiber'
import { Sphere, MeshTransmissionMaterial, Environment, OrbitControls } from '@react-three/drei'

let root = ReactDOM.createRoot(document.querySelector('#run_code_div'))

root.render(<div className="w-full h-full">
    <Canvas className="w-full h-full">
        <Sphere>
            <MeshTransmissionMaterial color="white" thickness={1.1}></MeshTransmissionMaterial>
        </Sphere>
        <Environment preset="lobby" background></Environment>
        <OrbitControls></OrbitControls>
    </Canvas>
</div>)

console.log('lok', lok)
        `,
            },
            {
                path: `/src/lok.js`,
                content: /* javascript */ `
export const yo = 'loklok'
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
