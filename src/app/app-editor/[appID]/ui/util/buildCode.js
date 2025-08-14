'use client'

import { transform } from 'sucrase'
import path from 'path'

export const buildCode = async ({ files = [] }) => {
    const URLPrefix = `loklok-protocol:`

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

                    console.log('resolving module: ', moduleName, parentBaseURL)

                    if (!parentBaseURL) {
                        return moduleName
                    }
                    if (moduleName === 'zustand') {
                        return `${siteOrigin}/dynamic-linked-library/zustand.js`
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
                    if (id.indexOf('http') === 0) {
                        return fetch(id, { mode: 'cors', method: 'GET' })
                            .then((r) => r.text())
                            .then((t) => {
                                return `${t}`
                            })
                    }

                    let file = files.find((e) => `${URLPrefix}${e.path}` === id)
                    if (!file) {
                        return `console.log('file is not found', ${JSON.stringify(id)})`
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
}

//