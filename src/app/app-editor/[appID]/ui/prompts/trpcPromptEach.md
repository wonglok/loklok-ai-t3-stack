```js

export function createProcedure ({ publicProcedure, protectedProcedure, output }) {
    let keyName = '' // please fill in procedure slug exactly in tech specification, it should be in camel case
    
    return {
        ...output,
        [keyName]: publicProcedure
            // please udpate input sanitisation according to the tech specification
            .input(z.object({
                username: z.string().min(3).max(20).trim(),
                email: z.string().email().trim(),
                password: z.string().min(8)
            }))

            // please udpate mutation function according to the tech specification
            .mutation(async ({ input }) => {
                const models = createModels(GLOBAL_APP_ID);
                const existing = await models.User.findOne({ $or: [{ username: input.username }, { email: input.email }] });
                if (existing) throw new Error('User already exists');
                const newUser = new models.User({
                    username: input.username,
                    email: input.email,
                    passwordHash: input.password
                });
                await newUser.save();
                const token = jwt.sign({ userId: newUser._id, role: newUser.role }, GLOBAL_APP_JWT_SECRET, { expiresIn: '1d' });
                return { user: JSON.parse(JSON.stringify(newUser)), token };
            })
    }
}


```