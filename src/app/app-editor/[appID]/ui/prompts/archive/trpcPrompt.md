```js

const publicProcedure = t.procedure;
const protectedProcedure = publicProcedure.use(authMiddleware);

const appRouter = t.router({
    login: publicProcedure
        .input(z.object({
            username: z.string().min(3).max(20).trim(),
            password: z.string().min(8)
        }))
        .mutation(async ({ input }) => {
            const models = createModels(GLOBAL_APP_ID);
            const user = await models.User.findOne({ username: input.username });
            if (!user) throw new Error('User not found');
            const valid = await bcrypt.compare(input.password, user.passwordHash);
            if (!valid) throw new Error('Invalid password');
            const token = jwt.sign({ userId: user._id, role: user.role }, GLOBAL_APP_JWT_SECRET, { expiresIn: '1d' });
            await models.User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
            return { user: JSON.parse(JSON.stringify(user)), token };
        }),

    register: publicProcedure
        .input(z.object({
            username: z.string().min(3).max(20).trim(),
            email: z.string().email().trim(),
            password: z.string().min(8)
        }))
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
        }),

    getCurrentUser: protectedProcedure
        .mutation(async ({ ctx }) => {
            const models = createModels(GLOBAL_APP_ID);
            const user = await models.User.findById(ctx.user.userId).select('-passwordHash');
            return user;
        }),

    // 
    // for each procedure in the techncial specification ([the appRouter procedures]) 
    // create the trpc server procedures here
    
});

```