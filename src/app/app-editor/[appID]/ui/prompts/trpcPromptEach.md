```js

export function createProcedure ({ publicProcedure, protectedProcedure, output }) {
    let procedureName = '' // please fill in procedure slug exactly in tech specification, it should be in camel case
    
    return {
        ...output,
        [procedureName]: publicProcedure
            // please udpate input sanitisation according to the tech specification
            .input(z.object({
                username: z.string().min(3).max(20).trim(),
                email: z.string().email().trim(),
                password: z.string().min(8)
            }))

            // please udpate mutation function according to the tech specification
            .mutation(async ({ input }) => {
                return {
                    // response
                }
            })
    }
}


```