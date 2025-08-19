**Objective**  
Build a single‑page front‑end application (login, register, dashboard) using React JS.

**Tech Stack**  
- State: **Zustand** (ESM module, selector pattern – one state property per selector)  
  ```js
  const username = useSDK(state => state.username);
  ```
- Routing: `<HashRouter>` from `react‑router‑dom`; use `const location = useLocation();` and read `location.pathname`.  
- UI: **shadcn** components + **Tailwind CSS** (no outer‑most `div` margin).  
- 3D: **@react-three/fiber** + **drei**.  
- API client: `const trpc = await getTRPC();` (keep `import { getTRPC } from './getTRPC.js';`).  
- Error/loading handling, security best practices.  
- All code in **ESM** (import/export).  
- No inline Zustand selectors; only exported hooks.  
- Prefer **typescript** over TypeScript.  
- Backend (not requested here): Mongoose + tRPC + Zod.

**Requirements**  
1. **Zustand store** – exported as `useSDK`.  
2. React components: **Login**, **Register**, **Dashboard** + simple layout.  
3. No explanatory comments or documentation inside files.  
4. `getTRPC` must be reused; no redundant imports.  

**Deliverables**  
- `src/useSDK.js` (Zustand store).  
- `src/getTRPC.js` (tRPC client factory).  
- `src/components/Login.jsx`, `Register.jsx`, `Dashboard.jsx`.  
- `src/App.jsx` (HashRouter, layout).  
- Any necessary Tailwind config.  




====

Build front end Sing Page Application code.

----- Zustand ----- 

- Zustand state management integration using selector method such as: let username = useSDK((r) => r.username)
- for selector in zustand, only use 1 property of state at a time
- have import and export using ESM for Zustand Module Code
- keep this line: import { getTRPC } from './getTRPC.js';
- make sure we reuse: const trpc = await getTRPC()

---- React ------

React Components for HTML

add following import for React Components:
import { useState } from "react";
import { useSDK } from "./useSDK";

- shadcn Library for User Interface Framework
- Responsive UI components
- UI components shouldn't have any margin pixel for the outermost div element.
- use Zustand for State Management for React
- Loading and error states
- Have import and export using ESM for React Components Code
- Include login, register, dashboard

- Cannot use zustand selector as inline varaible
- build a simple layout
- single page application with <HashRouter> from react-router-dom
- const location = useLocation()  
- use location.pathname instead of location.hash

- Tailwind CSS for styling for Frontend CSS Styling
- Comprehensive error handling
- typescript preferred over typescript
- Security best practices
- Free from explanatory comments or documentation
- Mongoose for backend
- tRPC + Zod for APIs
- React + typescript for Frontend HTML
- @react-three/fiber + drei for Frontend 3D
- Zustand for state management for Frontend State Management

=====


You Build tRPC typescript according to the Full Technical Specification that i will provide in the next message.

- only have 3 top level constant in this code snippet:
    1. const publicProcedure = t.procedure;
    2. const protectedProcedure = publicProcedure.use(authMiddleware);
    3. const appRouter = [...]

- check JWT validity on protected routes
- for appRouter, please dont use subrouter, please use flat structure for tRPC API
- please incldue this snippet in the generated code: const publicProcedure = t.procedure;
- please incldue this snippet in the generated code: const protectedProcedure = publicProcedure.use(authMiddleware)
- use protectedProcedure for authenicated users, private protected route
- use publicProcedure for anyone can use, public unprotected route
- use glboal varaible appID
- use createModels({ appID: appID })
- Avoid Duplicated Varaible such as "Uncaught SyntaxError: Identifier 'avatar' has already been declared"
- use GLOBAL_APP_JWT_SECRET instead of process.env.JWT_SECRET;
- Input validation with Zod and sanitization
- Authentication middleware
- backend trpc only use mutate, dont use query!!!
- frontend trpc only use mutate, dont use query!!!
- issue JWT when login flow is successful
- issue JWT when register flow is successful
- Comprehensive error handling
- Transaction support for complex operations



 Task:

            According to [the appRouter procedures] inside [The Full Technical Specification]

            - Use typescript
            - Use Vanilla tRPC
            - make sure the route of backend tRPC is same as frontend tRPC.
            - backend trpc only use mutate, dont use query!!!
            - frontend trpc only use mutate, dont use query!!!

            - Zustand state management integration using selector method such as:
                let username = useSDK((r) => r.username)
            - for selector in zustand, only use 1 property of state at a time
            - have import and export using ESM for Zustand Module Code
            - keep this line: import { getTRPC } from './getTRPC.js';
