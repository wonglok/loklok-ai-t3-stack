'use client'

import { transform } from 'sucrase'
import path from 'path'
export const URLPrefix = `loklok:`

export const buildCode = async ({ files = [] }) => {
    //
    console.log('building:start')

    // "rollup": "2.56.3",

    // yarn add rollup@"2.56.3"
    let rollup = await import('rollup/dist/rollup.browser.js').then(rmod => rmod.rollup);

    // @ts-ignore
    let bundler = rollup({
        input: `${URLPrefix}/entry/main.js`,
        plugins: [
            {
                name: 'loklok-runner',
                async resolveId(myself, others) {
                    console.log(myself, others)
                    if (!others) {
                        return myself
                    }
                    let baseURL = `${location.origin}`

                    if (myself === 'react-dom') {
                        return `${baseURL}/dynamic-linked-library/react-dom19.js`
                    }
                    if (myself === 'react') {
                        return `${baseURL}/dynamic-linked-library/react19.js`
                    }
                    if (myself === '@react-three/fiber') {
                        return `${baseURL}/dynamic-linked-library/@react-three/fiber.js`
                    }
                    if (myself === '@react-three/drei') {
                        return `${baseURL}/dynamic-linked-library/@react-three/drei.js`
                    }

                    if (myself === 'three') {
                        return `${baseURL}/dynamic-linked-library/three/build/three.module.js`
                    }
                    if (myself.indexOf('three/examples/') === 0) {
                        return `${baseURL}/dynamic-linked-library/three/examples/${myself.replace('three/examples/', '')}`
                    }

                    return new URL(myself, others).href
                },

                async load(id) {
                    if (id.indexOf('http') === 0) {
                        return fetch(id)
                            .then((r) => r.text())
                            .then((t) => {
                                return `${t}`
                            })
                    }

                    let file = files.find((e) => `${URLPrefix}${e.path}` === id)

                    if (!file) {
                        return `console.log('file is not found', ${JSON.stringify(id)})`
                    }

                    if (path.extname(file.path) === '.json') {
                        return `export default ${file.content}`
                    }
                    if (path.extname(file.path) === '.glsl') {
                        return `export default ${JSON.stringify(file.content)}`
                    }
                    if (path.extname(file.path) === '.vs') {
                        return `export default ${JSON.stringify(file.content)}`
                    }
                    if (path.extname(file.path) === '.fs') {
                        return `export default ${JSON.stringify(file.content)}`
                    }
                    if (path.extname(file.path) === '.vertex') {
                        return `export default ${JSON.stringify(file.content)}`
                    }
                    if (path.extname(file.path) === '.fragment') {
                        return `export default ${JSON.stringify(file.content)}`
                    }

                    if (file?.content) {
                        let tf = transform(file.content || '', {
                            transforms: ['jsx'],
                            // preserveDynamicImport: true,
                            production: true,
                            jsxPragma: 'React.createElement',
                            jsxFragmentPragma: 'React.Fragment',
                        }).code

                        return tf
                    }

                    return `console.log('yo, not-found-module',${JSON.stringify(id)})`
                },
            },
        ],
    })

    let compiler = await bundler

    let gen = await compiler.generate({
        output: {
            format: 'esm',
            // inlineDynamicImports: true,
        },
    })

    let finalOutput = gen.output.map((res) => {
        return {
            ...res,
            path: res.facadeModuleId.replace(URLPrefix, ''),
        }
    })

    // console.log(finalOutput)
    // console.table(finalOutput)

    console.log('building:end')

    return finalOutput
}

//