'use client'

import { transform } from 'sucrase'
import path from 'path'
import * as WouterMain from 'wouter'
import * as WouterHash from 'wouter/use-hash-location'


const libs = {
    ['wouter']: WouterMain,
    ['wouter/use-hash-location']: WouterHash,
}


export const buildCode = async ({ files = [] }) => {
    const URLPrefix = `dynamic-npm:`

    let siteOrigin = `${location.origin}`

    //
    console.log('building:start')

    // yarn add rollup@"2.56.3"
    let rollup = await import('rollup/dist/rollup.browser.js').then(rmod => rmod.rollup);

    // @ts-ignore
    let bundler = rollup({
        input: `${URLPrefix}/src/main.js`,
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
                        return `${siteOrigin}/dynamic-linked-library/zustand.js`
                    }
                    if (moduleName === 'wouter') {
                        return `dynamic-npm://wouter`
                    }
                    if (moduleName === 'wouter/use-hash-location') {
                        return `dynamic-npm://wouter/use-hash-location`
                    }
                    if (moduleName === 'react-dom') {
                        return `${siteOrigin}/dynamic-linked-library/react-dom19.js`
                    }
                    if (moduleName === 'react') {
                        return `${siteOrigin}/dynamic-linked-library/react19.js`
                    }
                    if (moduleName === '@react-three/fiber') {
                        return `${siteOrigin}/dynamic-linked-library/@react-three/fiber.js`
                    }
                    if (moduleName === '@react-three/drei') {
                        return `${siteOrigin}/dynamic-linked-library/@react-three/drei.js`
                    }
                    if (moduleName === 'three') {
                        return `${siteOrigin}/dynamic-linked-library/three.js-r179/three/build/three.module.js`
                    }
                    if (moduleName.indexOf('three/examples/') === 0) {
                        return `${siteOrigin}/dynamic-linked-library/three.js-r179/three/examples/${moduleName.replace('three/examples/', '')}`
                    }

                    return new URL(moduleName, parentBaseURL).href
                },

                async load(id) {
                    console.log(id)

                    if (id.indexOf('dynamic-npm://') === 0) {
                        let pureID = id.replace('dynamic-npm://', '')
                        console.log('dynamic-npm', pureID)

                        let text

                        text = `
                                // @ts-ignore
                                window.LokLokNpm = window.LokLokNpm || {};
                                // @ts-ignore
                                const LokLokNpm = window.LokLokNpm;
                                LokLokNpm[${JSON.stringify(pureID)}] = LokLokNpm[${JSON.stringify(pureID)}] || {}; 
                            `

                        for (let keyname in libs[pureID]) {
                            if (keyname !== 'default') {
                                text += `
                        export const ${keyname} = LokLokNpm[${JSON.stringify(pureID)}]['${keyname}'];
                        `
                            } else {
                                text += `
                        export default LokLokNpm[${JSON.stringify(pureID)}]['${keyname}'];
                        `
                            }
                        }


                        return `${text}`
                    }

                    if (id.indexOf('http') === 0) {
                        return fetch(id, { mode: 'cors', method: 'GET' })
                            .then((r) => r.text())
                            .then((t) => {
                                return `${t}`
                            })
                    }

                    let file = files.find((e) => `${URLPrefix}${e.path}` === id)
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
                            console.log(file?.content)

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
                path: res.facadeModuleId.replace(URLPrefix, ''),
            }
        })

        console.log('building:end')

        return finalOutput

    } catch (e) {
        console.log('building:error')
        console.error(e)

        return ''
    }
}

//