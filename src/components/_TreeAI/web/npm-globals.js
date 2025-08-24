import * as React from 'react'
import * as TRPCClient from '@trpc/client'
import * as ReactDOM from 'react-dom/client'
import * as Drei from '@react-three/drei'
import * as Fiber from '@react-three/fiber'
import * as Zustand from 'zustand'
import * as WouterBase from 'wouter'
import * as WouterHash from 'wouter/use-hash-location'
import * as Axios from 'axios'
import * as UUID from 'uuid'

export const NPMCacheTasks = [
    //
    {
        name: `npm-@trpc/client`,
        output: `/vendor/@trpc/client.js`,
        importVaraible: TRPCClient,
    },
    {
        name: `npm-@react-three/drei`,
        output: `/vendor/@react-three/drei.js`,
        importVaraible: Drei,
    },
    //
    {
        name: `npm-@react-three/fiber`,
        output: `/vendor/@react-three/fiber.js`,
        importVaraible: Fiber,
    },
    {
        name: `npm-react`,
        output: `/vendor/react19.js`,
        importVaraible: React,
    },
    {
        name: `npm-react-dom`,
        output: `/vendor/react-dom19.js`,
        importVaraible: ReactDOM,
    },
    {
        name: `npm-zustand`,
        output: `/vendor/zustand.js`,
        importVaraible: Zustand,
    },
    {
        name: `npm-wouter`,
        output: `/vendor/wouter.js`,
        importVaraible: WouterBase,
    },
    {
        name: `npm-wouter/use-hash-location`,
        output: `/vendor/wouter-hash-location.js`,
        importVaraible: WouterHash,
    },
    {
        name: `npm-axios`,
        output: `/vendor/axios.js`,
        importVaraible: Axios,
    },
    {
        name: `npm-uuid`,
        output: `/vendor/uuid.js`,
        importVaraible: UUID,
    },
]

