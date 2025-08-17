'use client'
import ReactDOM19 from 'react-dom/client'
import * as React19 from 'react'
import * as ReactThreeDrei from '@react-three/drei'
import * as ReactThreeFiber from '@react-three/fiber'
import * as Zustand from 'zustand'
import * as WouterBase from 'wouter'
import * as WouterHash from 'wouter/use-hash-location'

export function CodeRunner() {
    React19.useEffect(() => {
        let run = async () => {

            let urlSelf = new URL(window.location.href)
            let blobURL = urlSelf.searchParams.get('blob')

            let fileList = await fetch(blobURL).then((r) => r.json()) || []

            // @ts-ignore
            window.NPM_GV_CACHE = window.NPM_GV_CACHE || {}

            // @ts-ignore
            const NPM_GV_CACHE = window.NPM_GV_CACHE
            NPM_GV_CACHE['TJ-react-dom19'] = ReactDOM19
            NPM_GV_CACHE['TJ-react19'] = React19
            NPM_GV_CACHE['TJ-@react-three/drei'] = ReactThreeDrei
            NPM_GV_CACHE['TJ-@react-three/fiber'] = ReactThreeFiber
            NPM_GV_CACHE['TJ-zustand'] = Zustand
            NPM_GV_CACHE['TJ-wouter'] = WouterBase
            NPM_GV_CACHE['TJ-wouter/use-hash-location'] = WouterHash

            window['React'] = React19

            // @ts-ignore
            window.esmsInitOptions = {
                shimMode: true,
                enforceIntegrity: false,
                resolve: (id, parentUrl, resolve) => {
                    console.log(id)
                    let fileEntry = fileList.find((it) => {
                        return it.path === id
                    })
                    return URL.createObjectURL(new Blob([fileEntry?.code || ''], { type: 'application/javascript' }))
                },
            }

            // @ts-ignore
            window.importHttpModule = window.importHttpModule || (() => { })
            // @ts-ignore
            window.importHttpModule(`/global-vars/es-module-shims/es-module-shims.js`).then(() => {
                // @ts-ignore
                window.importShim('/src/main.js')
            })
        }
        run()
    }, [])

    return (
        <div className='w-full h-full'>
            <div
                className=' hidden'
                dangerouslySetInnerHTML={{
                    __html: `
        <script>
        window.importHttpModule = (v) => import(v);
        </script>
`,
                }}
            ></div>
            <div className='w-full h-full' id='run_code_div'></div>
        </div>
    )
}