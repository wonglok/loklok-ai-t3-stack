import fs from 'fs'
import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import * as Drei from '@react-three/drei'
import * as Fiber from '@react-three/fiber'

const here = import.meta.dirname

{
    let str = `
// @ts-ignore
window.LokLokNpm = window.LokLokNpm || {};
// @ts-ignore
const LokLokNpm = window.LokLokNpm;

LokLokNpm['@react-three/drei'] = LokLokNpm['@react-three/drei'] || {}; 
`
    for (let keyname in Drei) {
        if (keyname !== 'default') {
            str += `
export const ${keyname} = LokLokNpm['@react-three/drei']['${keyname}'];
`
        } else {
            str += `
export default LokLokNpm['@react-three/drei']['${keyname}'];
`
        }
    }

    fs.writeFileSync(`${here}/public/dynamic-linked-library/@react-three/drei.js`, str)
    console.log('dynamic-linked-library: drei')
}

{
    let text = `
// @ts-ignore
window.LokLokNpm = window.LokLokNpm || {};
// @ts-ignore
const LokLokNpm = window.LokLokNpm;

LokLokNpm['@react-three/fiber'] = LokLokNpm['@react-three/fiber'] || {}; 
`
    for (let keyname in Fiber) {
        if (keyname !== 'default') {
            text += `
export const ${keyname} = LokLokNpm['@react-three/fiber']['${keyname}'];
`
        } else {
            text += `
export default LokLokNpm['@react-three/fiber']['${keyname}'];
`
        }
    }

    fs.writeFileSync(`${here}/public/dynamic-linked-library/@react-three/fiber.js`, text)
    console.log('dynamic-linked-library: fiber')
}

{
    let text = `
// @ts-ignore
window.LokLokNpm = window.LokLokNpm || {};
// @ts-ignore
const LokLokNpm = window.LokLokNpm;

LokLokNpm['react19'] = LokLokNpm['react19'] || {}; 
`
    for (let keyname in React) {
        if (keyname !== 'default') {
            if (keyname === '__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED') {
                continue
            }

            text += `
export const ${keyname} = LokLokNpm['react19']['${keyname}'];
`
        } else {
            text += `
export default LokLokNpm['react19']['${keyname}'];
`
        }
    }
    fs.writeFileSync(`${here}/public/dynamic-linked-library/react19.js`, text)
    console.log('dynamic-linked-library: react19')
}

{
    let text = `
// @ts-ignore
window.LokLokNpm = window.LokLokNpm || {};
// @ts-ignore
const LokLokNpm = window.LokLokNpm;

LokLokNpm['react-dom19'] = LokLokNpm['react-dom19'] || {}; 
`
    for (let keyname in ReactDOM) {
        if (keyname !== 'default') {
            if (keyname === '__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED') {
                continue
            }

            text += `
export const ${keyname} = LokLokNpm['react-dom19']['${keyname}'];
`
        } else {
            text += `
export default LokLokNpm['react-dom19']['${keyname}'];
`
        }
    }
    fs.writeFileSync(`${here}/public/dynamic-linked-library/react-dom19.js`, text)
    console.log('dynamic-linked-library: react-dom19')
}

