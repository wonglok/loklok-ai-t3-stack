"use client";

import { useGenAI } from "../../useGenAI";
import { useFilesFrame } from "./useFilesFrame";

export function CodePod() {
    let files = useGenAI(r => r.files) || []

    let componentsManifest

    try {
        componentsManifest = JSON.parse(files.find(r => r.path === '/app/components.json')?.content || '{}')
    } catch (e) {
        // console.log(e)
    }

    // console.log(componentsManifest?.components)

    let importUIComponentSnippet = componentsManifest?.components?.reduce((acc, item, key) => {

        // some file may not show upp because it's being written by ai
        if (files.some(r => r.filename.includes(item.slug))) {
            acc += `import { ${item.componentName} } from "/ui/${item.slug}.js"\n`
        }

        return acc
    }, '') || '';

    // console.log(importUIComponentSnippet)

    let { show } = useFilesFrame({
        files: [
            ...files,
            {
                path: `/ui/useFrontEnd.js`,
                content: /* javascript */ `
import { create } from 'zustand'

export const useFrontEnd = create((set, get) =>{
    return {
        apple: '123123'
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
import { useFrontEnd } from '/ui/useFrontEnd.js'

import componentsRoot from '/app/components.json'

${importUIComponentSnippet}

export function App () {
    let apple = useFrontEnd((r) => r.apple);

    return <div className="w-full h-full relative">
        <Canvas className="w-full h-full ">
            <Sphere>
                <MeshTransmissionMaterial color="white" thickness={1.1}></MeshTransmissionMaterial>
            </Sphere>
            <Environment preset="lobby" background></Environment>
            <OrbitControls></OrbitControls>
        </Canvas>

        <div className=" absolute top-0 left-0 z-100">
            {apple}
        </div>
    </div>
}
`,
            },
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
