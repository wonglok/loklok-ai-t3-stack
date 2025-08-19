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

NPM_CACHE['npm-@react-three/drei'] = NPM_CACHE['npm-@react-three/drei'] || {}; 
`
        for (let keyname in Drei) {
            if (keyname !== 'default') {
                str += `
export const ${keyname} = NPM_CACHE['npm-@react-three/drei']['${keyname}'];
`
            } else {
                str += `
export default NPM_CACHE['npm-@react-three/drei']['${keyname}'];
`
            }
        }

        fs.writeFileSync(`${here}/public/npm-globals/@react-three/drei.js`, str)
    },
}, {
    func: () => {
        let text = `
// @ts-ignore
window.NPM_CACHE = window.NPM_CACHE || {};
// @ts-ignore
const NPM_CACHE = window.NPM_CACHE;

NPM_CACHE['npm-@react-three/fiber'] = NPM_CACHE['npm-@react-three/fiber'] || {}; 
`
        for (let keyname in Fiber) {
            if (keyname !== 'default') {
                text += `
export const ${keyname} = NPM_CACHE['npm-@react-three/fiber']['${keyname}'];
`
            } else {
                text += `
export default NPM_CACHE['npm-@react-three/fiber']['${keyname}'];
`
            }
        }

        fs.writeFileSync(`${here}/public/npm-globals/@react-three/fiber.js`, text)
    }
}, {
    func: () => {
        let text = `
// @ts-ignore
window.NPM_CACHE = window.NPM_CACHE || {};
// @ts-ignore
const NPM_CACHE = window.NPM_CACHE;

NPM_CACHE['npm-react19'] = NPM_CACHE['npm-react19'] || {}; 
`
        for (let propertyName in React) {
            if (propertyName === '__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED') {
                //
            } else if (propertyName === 'default') {
                text += `
export default NPM_CACHE['npm-react19']['${propertyName}'];
`
            } else {
                text += `
export const ${propertyName} = NPM_CACHE['npm-react19']['${propertyName}'];
`
            }
        }
        fs.writeFileSync(`${here}/public/npm-globals/react19.js`, text)
    }
}, {
    func: () => {
        let text = `
// @ts-ignore
window.NPM_CACHE = window.NPM_CACHE || {};
// @ts-ignore
const NPM_CACHE = window.NPM_CACHE;

NPM_CACHE['npm-react-dom19'] = NPM_CACHE['npm-react-dom19'] || {}; 
`
        for (let propertyName in ReactDOM) {
            if (propertyName === '__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED') {
                //
            } else if (propertyName === 'default') {
                text += `
export default NPM_CACHE['npm-react-dom19']['${propertyName}'];
`
            } else {
                text += `
export const ${propertyName} = NPM_CACHE['npm-react-dom19']['${propertyName}'];
`
            }
        }
        fs.writeFileSync(`${here}/public/npm-globals/react-dom19.js`, text)
    }
}, {
    func: () => {


        {
            let text = `
// @ts-ignore
window.NPM_CACHE = window.NPM_CACHE || {};
// @ts-ignore
const NPM_CACHE = window.NPM_CACHE;

NPM_CACHE['npm-zustand'] = NPM_CACHE['npm-zustand'] || {}; 
`
            for (let keyname in Zustand) {
                if (keyname !== 'default') {
                    text += `
export const ${keyname} = NPM_CACHE['npm-zustand']['${keyname}'];
`
                } else {
                    text += `
export default NPM_CACHE['npm-zustand']['${keyname}'];
`
                }
            }
            fs.writeFileSync(`${here}/public/npm-globals/zustand.js`, text)
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

NPM_CACHE['npm-wouter'] = NPM_CACHE['npm-wouter'] || {}; 
`
            for (let keyname in WouterBase) {
                if (keyname !== 'default') {
                    text += `
export const ${keyname} = NPM_CACHE['npm-wouter']['${keyname}'];
`
                } else {
                    text += `
export default NPM_CACHE['npm-wouter']['${keyname}'];
`
                }
            }
            fs.writeFileSync(`${here}/public/npm-globals/wouter.js`, text)
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

NPM_CACHE['npm-wouter/use-hash-location'] = NPM_CACHE['npm-wouter/use-hash-location'] || {}; 
`
            for (let keyname in WouterHash) {
                if (keyname !== 'default') {
                    text += `
export const ${keyname} = NPM_CACHE['npm-wouter/use-hash-location']['${keyname}'];
`
                } else {
                    text += `
export default NPM_CACHE['npm-wouter/use-hash-location']['${keyname}'];
`
                }
            }
            fs.writeFileSync(`${here}/public/npm-globals/wouter-hash-location.js`, text)
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