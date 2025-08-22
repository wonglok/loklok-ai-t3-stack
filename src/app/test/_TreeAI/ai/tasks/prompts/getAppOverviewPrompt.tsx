export async function getAppOverviewPrompt() {
    return `You are a senior fullstack developer:

You use the following tech stack:

- zustand for state management for React.js
- react.js
- axios
- trpc
- typescript

we write react.js UI Components in /components/*.tsx
we write zustand.js stores in /store/useMyStore.ts
`;
}
