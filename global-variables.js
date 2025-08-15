import fs from 'fs'
import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import * as Drei from '@react-three/drei'
import * as Fiber from '@react-three/fiber'
import * as Zustand from 'zustand'
import * as WouterBase from 'wouter'
import * as WouterHash from 'wouter/use-hash-location'

const here = import.meta.dirname

{
    let str = `
// @ts-ignore
window.NPM_GV_CACHE = window.NPM_GV_CACHE || {};
// @ts-ignore
const NPM_GV_CACHE = window.NPM_GV_CACHE;

NPM_GV_CACHE['TJ-@react-three/drei'] = NPM_GV_CACHE['TJ-@react-three/drei'] || {}; 
`
    for (let keyname in Drei) {
        if (keyname !== 'default') {
            str += `
export const ${keyname} = NPM_GV_CACHE['TJ-@react-three/drei']['${keyname}'];
`
        } else {
            str += `
export default NPM_GV_CACHE['TJ-@react-three/drei']['${keyname}'];
`
        }
    }

    fs.writeFileSync(`${here}/public/dynamic-linked-library/@react-three/drei.js`, str)
    console.log('dynamic-linked-library: drei')
}

{
    let text = `
// @ts-ignore
window.NPM_GV_CACHE = window.NPM_GV_CACHE || {};
// @ts-ignore
const NPM_GV_CACHE = window.NPM_GV_CACHE;

NPM_GV_CACHE['TJ-@react-three/fiber'] = NPM_GV_CACHE['TJ-@react-three/fiber'] || {}; 
`
    for (let keyname in Fiber) {
        if (keyname !== 'default') {
            text += `
export const ${keyname} = NPM_GV_CACHE['TJ-@react-three/fiber']['${keyname}'];
`
        } else {
            text += `
export default NPM_GV_CACHE['TJ-@react-three/fiber']['${keyname}'];
`
        }
    }

    fs.writeFileSync(`${here}/public/dynamic-linked-library/@react-three/fiber.js`, text)
    console.log('dynamic-linked-library: fiber')
}

{
    let text = `
// @ts-ignore
window.NPM_GV_CACHE = window.NPM_GV_CACHE || {};
// @ts-ignore
const NPM_GV_CACHE = window.NPM_GV_CACHE;

NPM_GV_CACHE['TJ-react19'] = NPM_GV_CACHE['TJ-react19'] || {}; 
`
    for (let propertyName in React) {
        if (propertyName === '__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED') {
            //
        } else if (propertyName === 'default') {
            text += `
export default NPM_GV_CACHE['TJ-react19']['${propertyName}'];
`
        } else {
            text += `
export const ${propertyName} = NPM_GV_CACHE['TJ-react19']['${propertyName}'];
`
        }
    }
    fs.writeFileSync(`${here}/public/dynamic-linked-library/react19.js`, text)
    console.log('dynamic-linked-library: react19')
}

{
    let text = `
// @ts-ignore
window.NPM_GV_CACHE = window.NPM_GV_CACHE || {};
// @ts-ignore
const NPM_GV_CACHE = window.NPM_GV_CACHE;

NPM_GV_CACHE['TJ-react-dom19'] = NPM_GV_CACHE['TJ-react-dom19'] || {}; 
`
    for (let propertyName in ReactDOM) {
        if (propertyName === '__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED') {
            //
        } else if (propertyName === 'default') {
            text += `
export default NPM_GV_CACHE['TJ-react-dom19']['${propertyName}'];
`
        } else {
            text += `
export const ${propertyName} = NPM_GV_CACHE['TJ-react-dom19']['${propertyName}'];
`
        }
    }
    fs.writeFileSync(`${here}/public/dynamic-linked-library/react-dom19.js`, text)
    console.log('dynamic-linked-library: react-dom19')
}

{
    let text = `
// @ts-ignore
window.NPM_GV_CACHE = window.NPM_GV_CACHE || {};
// @ts-ignore
const NPM_GV_CACHE = window.NPM_GV_CACHE;

NPM_GV_CACHE['TJ-zustand'] = NPM_GV_CACHE['TJ-zustand'] || {}; 
`
    for (let keyname in Zustand) {
        if (keyname !== 'default') {
            text += `
export const ${keyname} = NPM_GV_CACHE['TJ-zustand']['${keyname}'];
`
        } else {
            text += `
export default NPM_GV_CACHE['TJ-zustand']['${keyname}'];
`
        }
    }
    fs.writeFileSync(`${here}/public/dynamic-linked-library/zustand.js`, text)
    console.log('dynamic-linked-library: zustand')
}



{
    let text = `
// @ts-ignore
window.NPM_GV_CACHE = window.NPM_GV_CACHE || {};
// @ts-ignore
const NPM_GV_CACHE = window.NPM_GV_CACHE;

NPM_GV_CACHE['TJ-wouter'] = NPM_GV_CACHE['TJ-wouter'] || {}; 
`
    for (let keyname in WouterBase) {
        if (keyname !== 'default') {
            text += `
export const ${keyname} = NPM_GV_CACHE['TJ-wouter']['${keyname}'];
`
        } else {
            text += `
export default NPM_GV_CACHE['TJ-wouter']['${keyname}'];
`
        }
    }
    fs.writeFileSync(`${here}/public/dynamic-linked-library/wouter.js`, text)
    console.log('dynamic-linked-library: wouter')
}



{
    let text = `
// @ts-ignore
window.NPM_GV_CACHE = window.NPM_GV_CACHE || {};
// @ts-ignore
const NPM_GV_CACHE = window.NPM_GV_CACHE;

NPM_GV_CACHE['TJ-wouter/use-hash-location'] = NPM_GV_CACHE['TJ-wouter/use-hash-location'] || {}; 
`
    for (let keyname in WouterHash) {
        if (keyname !== 'default') {
            text += `
export const ${keyname} = NPM_GV_CACHE['TJ-wouter/use-hash-location']['${keyname}'];
`
        } else {
            text += `
export default NPM_GV_CACHE['TJ-wouter/use-hash-location']['${keyname}'];
`
        }
    }
    fs.writeFileSync(`${here}/public/dynamic-linked-library/wouter-hash-location.js`, text)
    console.log('dynamic-linked-library: wouter/use-hash-location')
}

