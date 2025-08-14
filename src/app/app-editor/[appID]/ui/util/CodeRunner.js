'use client'
import ReactDOM19 from 'react-dom/client'
import * as React19 from 'react'
import * as ReactThreeDrei from '@react-three/drei'
import * as ReactThreeFiber from '@react-three/fiber'
import * as Zustand from 'zustand'

export function CodeRunner() {
    React19.useEffect(() => {
        let run = async () => {

            let urlSelf = new URL(window.location.href)
            let blobURL = urlSelf.searchParams.get('blob')

            let fileList = await fetch(blobURL).then((r) => r.json())

            // @ts-ignore
            window.LokLokNpm = window.LokLokNpm || {}

            // @ts-ignore
            const LokLokNpm = window.LokLokNpm
            LokLokNpm['react-dom19'] = ReactDOM19
            LokLokNpm['react19'] = React19
            LokLokNpm.React = React19
            LokLokNpm['@react-three/drei'] = ReactThreeDrei
            LokLokNpm['@react-three/fiber'] = ReactThreeFiber
            LokLokNpm['zustand'] = Zustand

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
            window.importHttpModule(`/dynamic-linked-library/es-module-shims/es-module-shims.js`).then(() => {
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