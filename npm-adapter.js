import fs from 'fs'
import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import * as Drei from '@react-three/drei'
import * as Fiber from '@react-three/fiber'
import * as Zustand from 'zustand'
import * as WouterBase from 'wouter'
import * as WouterHash from 'wouter/use-hash-location'

const here = import.meta.dirname

let tasks = [{
    func: () => {
        let str = `
// @ts-ignore
window.NPM_CACHE = window.NPM_CACHE || {};
// @ts-ignore
const NPM_CACHE = window.NPM_CACHE;

NPM_CACHE['TJ-@react-three/drei'] = NPM_CACHE['TJ-@react-three/drei'] || {}; 
`
        for (let keyname in Drei) {
            if (keyname !== 'default') {
                str += `
export const ${keyname} = NPM_CACHE['TJ-@react-three/drei']['${keyname}'];
`
            } else {
                str += `
export default NPM_CACHE['TJ-@react-three/drei']['${keyname}'];
`
            }
        }

        fs.writeFileSync(`${here}/public/global-vars/@react-three/drei.js`, str)
    },
}, {
    func: () => {
        let text = `
// @ts-ignore
window.NPM_CACHE = window.NPM_CACHE || {};
// @ts-ignore
const NPM_CACHE = window.NPM_CACHE;

NPM_CACHE['TJ-@react-three/fiber'] = NPM_CACHE['TJ-@react-three/fiber'] || {}; 
`
        for (let keyname in Fiber) {
            if (keyname !== 'default') {
                text += `
export const ${keyname} = NPM_CACHE['TJ-@react-three/fiber']['${keyname}'];
`
            } else {
                text += `
export default NPM_CACHE['TJ-@react-three/fiber']['${keyname}'];
`
            }
        }

        fs.writeFileSync(`${here}/public/global-vars/@react-three/fiber.js`, text)
    }
}, {
    func: () => {
        let text = `
// @ts-ignore
window.NPM_CACHE = window.NPM_CACHE || {};
// @ts-ignore
const NPM_CACHE = window.NPM_CACHE;

NPM_CACHE['TJ-react19'] = NPM_CACHE['TJ-react19'] || {}; 
`
        for (let propertyName in React) {
            if (propertyName === '__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED') {
                //
            } else if (propertyName === 'default') {
                text += `
export default NPM_CACHE['TJ-react19']['${propertyName}'];
`
            } else {
                text += `
export const ${propertyName} = NPM_CACHE['TJ-react19']['${propertyName}'];
`
            }
        }
        fs.writeFileSync(`${here}/public/global-vars/react19.js`, text)
    }
}, {
    func: () => {
        let text = `
// @ts-ignore
window.NPM_CACHE = window.NPM_CACHE || {};
// @ts-ignore
const NPM_CACHE = window.NPM_CACHE;

NPM_CACHE['TJ-react-dom19'] = NPM_CACHE['TJ-react-dom19'] || {}; 
`
        for (let propertyName in ReactDOM) {
            if (propertyName === '__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED') {
                //
            } else if (propertyName === 'default') {
                text += `
export default NPM_CACHE['TJ-react-dom19']['${propertyName}'];
`
            } else {
                text += `
export const ${propertyName} = NPM_CACHE['TJ-react-dom19']['${propertyName}'];
`
            }
        }
        fs.writeFileSync(`${here}/public/global-vars/react-dom19.js`, text)
    }
}, {
    func: () => {


        {
            let text = `
// @ts-ignore
window.NPM_CACHE = window.NPM_CACHE || {};
// @ts-ignore
const NPM_CACHE = window.NPM_CACHE;

NPM_CACHE['TJ-zustand'] = NPM_CACHE['TJ-zustand'] || {}; 
`
            for (let keyname in Zustand) {
                if (keyname !== 'default') {
                    text += `
export const ${keyname} = NPM_CACHE['TJ-zustand']['${keyname}'];
`
                } else {
                    text += `
export default NPM_CACHE['TJ-zustand']['${keyname}'];
`
                }
            }
            fs.writeFileSync(`${here}/public/global-vars/zustand.js`, text)
        }

    }
}, {
    func: () => {
        {
            let text = `
// @ts-ignore
window.NPM_CACHE = window.NPM_CACHE || {};
// @ts-ignore
const NPM_CACHE = window.NPM_CACHE;

NPM_CACHE['TJ-wouter'] = NPM_CACHE['TJ-wouter'] || {}; 
`
            for (let keyname in WouterBase) {
                if (keyname !== 'default') {
                    text += `
export const ${keyname} = NPM_CACHE['TJ-wouter']['${keyname}'];
`
                } else {
                    text += `
export default NPM_CACHE['TJ-wouter']['${keyname}'];
`
                }
            }
            fs.writeFileSync(`${here}/public/global-vars/wouter.js`, text)
        }
    }
}, {
    func: () => {


        {
            let text = `
// @ts-ignore
window.NPM_CACHE = window.NPM_CACHE || {};
// @ts-ignore
const NPM_CACHE = window.NPM_CACHE;

NPM_CACHE['TJ-wouter/use-hash-location'] = NPM_CACHE['TJ-wouter/use-hash-location'] || {}; 
`
            for (let keyname in WouterHash) {
                if (keyname !== 'default') {
                    text += `
export const ${keyname} = NPM_CACHE['TJ-wouter/use-hash-location']['${keyname}'];
`
                } else {
                    text += `
export default NPM_CACHE['TJ-wouter/use-hash-location']['${keyname}'];
`
                }
            }
            fs.writeFileSync(`${here}/public/global-vars/wouter-hash-location.js`, text)
        }
    }
}, {
    func: () => {

    }
}, {
    func: () => {

    }
}, {
    func: () => {

    }
}, {
    func: () => {

    }
}]

tasks.map((t) => { t.func() })