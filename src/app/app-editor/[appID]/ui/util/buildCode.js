'use client'

import { transform } from 'sucrase'
import path from 'path'


export const buildCode = async ({ files = [] }) => {
    const CodePrefix = `dynamic-code:`
    const NPMPrefix = `dynamic-npm:`
    const NetworkPrefix = `${location.origin}`

    //
    console.log('building:start')

    // yarn add rollup@"2.56.3"
    let rollup = await import('rollup/dist/rollup.browser.js').then(rmod => rmod.rollup);

    // @ts-ignore
    let bundler = rollup({
        input: `${CodePrefix}/src/main.js`,
        plugins: [
            {
                name: 'loklok-runner',
                async resolveId(moduleName, parentBaseURL) {
                    //

                    console.log('resolving module: ', moduleName, 'required by', parentBaseURL)

                    if (!parentBaseURL) {
                        return moduleName
                    }
                    if (moduleName === 'zustand') {
                        return `${NetworkPrefix}/dynamic-linked-library/zustand.js`
                    }
                    if (moduleName === 'wouter') {
                        return `${NetworkPrefix}/dynamic-linked-library/wouter.js`
                    }
                    if (moduleName === 'wouter/use-hash-location') {
                        return `${NetworkPrefix}/dynamic-linked-library/wouter-hash-location.js`
                    }

                    /// NETWORK DOWNLOAD_LOAD ///
                    if (moduleName === 'react-dom') {
                        return `${NetworkPrefix}/dynamic-linked-library/react-dom19.js`
                    }
                    if (moduleName === 'react') {
                        return `${NetworkPrefix}/dynamic-linked-library/react19.js`
                    }
                    if (moduleName === '@react-three/fiber') {
                        return `${NetworkPrefix}/dynamic-linked-library/@react-three/fiber.js`
                    }
                    if (moduleName === '@react-three/drei') {
                        return `${NetworkPrefix}/dynamic-linked-library/@react-three/drei.js`
                    }
                    if (moduleName === 'three') {
                        return `${NetworkPrefix}/dynamic-linked-library/three.js-r179/three/build/three.module.js`
                    }
                    if (moduleName.indexOf('three/examples/') === 0) {
                        return `${NetworkPrefix}/dynamic-linked-library/three.js-r179/three/examples/${moduleName.replace('three/examples/', '')}`
                    }

                    return new URL(moduleName, parentBaseURL).href
                },

                async load(id) {
                    // if (id.indexOf(`${NPMPrefix}`) === 0) {
                    //     let pureID = id.replace(`${NPMPrefix}`, '')
                    //     console.log('dynamic-npm', pureID)
                    //     let text
                    //     let npmID = JSON.stringify(pureID)
                    //     text = `
                    //             // @ts-ignore
                    //             window.NPM_GV_CACHE = window.NPM_GV_CACHE || {};
                    //             // @ts-ignore
                    //             const NPM_GV_CACHE = window.NPM_GV_CACHE;
                    //             NPM_GV_CACHE[${npmID}] = NPM_GV_CACHE[${npmID}] || {}; 
                    //         `
                    //     for (let propertyName in libs[pureID]) {
                    //         if (propertyName !== 'default') {
                    //             text += `
                    //     export const ${propertyName} = NPM_GV_CACHE[${npmID}]['${propertyName}'];
                    //     `
                    //         } else {
                    //             text += `
                    //     export default NPM_GV_CACHE[${npmID}]['${propertyName}'];
                    //     `
                    //         }
                    //     }
                    //     return `${text}`
                    // }

                    if (id.indexOf('http') === 0) {
                        return fetch(id, { mode: 'cors', method: 'GET' })
                            .then((r) => r.text())
                            .then((t) => {
                                return `${t}`
                            })
                    }

                    let file = files.find((e) => `${CodePrefix}${e.path}` === id)
                    if (!file) {
                        return `console.log('file is not found or is under generation', ${JSON.stringify(id)})`
                    }

                    if (path.extname(file.path) === '.json') {
                        return `export default ${JSON.stringify(file.content)}`
                    }
                    if (path.extname(file.path) === '.vertex') {
                        return `export default ${JSON.stringify(file.content)}`
                    }
                    if (path.extname(file.path) === '.fragment') {
                        return `export default ${JSON.stringify(file.content)}`
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

                    if (file?.content) {
                        try {
                            let javascript = transform(file.content || '', {
                                transforms: ['jsx'],
                                preserveDynamicImport: true,
                                production: true,
                                jsxPragma: 'React.createElement',
                                jsxFragmentPragma: 'React.Fragment',
                            }).code

                            return javascript
                        } catch (e) {
                            console.log(e)
                            console.error('error', file.path, file?.content)

                            return file?.content
                        }

                    }

                    return `console.log('moudle is not found',${JSON.stringify(id)})`
                },
            },
        ],
    })
    try {

        let compiler = await bundler

        let gen = await compiler.generate({
            output: {
                format: 'esm',
                inlineDynamicImports: true,
            },
        })

        let finalOutput = gen.output.map((res) => {
            return {
                ...res,
                path: res.facadeModuleId.replace(CodePrefix, ''),
            }
        })

        console.log('building:end')

        return finalOutput

    } catch (e) {
        console.log('building:error')
        console.log(e)

        return ''
    }
}

//