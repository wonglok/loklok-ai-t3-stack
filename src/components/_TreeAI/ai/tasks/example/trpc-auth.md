(function ({
    // @ts-ignore  // MUST NOT modify the next line
    createTRPCRouter, z, models, rootRouter, publicProcedure, protectedProcedure, jwt, bcrypt, JWT_SECRET, ObjectId, mongoose, dbInstance  // MUST NOT modify this line
    // MUST NOT modify the above line
}) {
    const User = dbInstance.model("User")
        
    const authRouter = createTRPCRouter({
        register: publicProcedure
            .input(z.object({
                email: z.string(),
                password: z.string().min(6),
            }))
            .mutation(async ({ input }) => {
                const existing = await User.findOne({ email: input.email });
                if (existing) throw new Error('Email already in use');

                const hashed = await bcrypt.hash(input.password, 10);
                const user = await User.create({ email: input.email, passwordHash: hashed });

                const token = jwt.sign({ _id: String(user._id) }, JWT_SECRET, { expiresIn: '9years' });
                return { token, userID: `${user._id}` };
            }),
        login: publicProcedure
            .input(z.object({
                email: z.string(),
                password: z.string(),
            }))
            .mutation(async ({ input }) => {
                const user = await User.findOne({ email: input.email });

                if (!user) throw new Error('Invalid credentials');

                const match = await bcrypt.compare(input.password, user.passwordHash);
                if (!match) throw new Error('Invalid credentials');

                const token = jwt.sign({ _id: String(`${user._id}`) }, JWT_SECRET, { expiresIn: '9years' });
                return { token, userID: `${user._id}` };
            }),
        logout: protectedProcedure
            .mutation(async ({ ctx }) => {
                // Assuming session is handled elsewhere; simply invalidate on client side
                return { success: true };
            }),
        hydrate: publicProcedure
            .input(z.object({
                token: z.string(),
            }))
            .mutation(async ({ input }) => {
                try {
                    const decoded = jwt.verify(input.token, JWT_SECRET);
                    if (!decoded || !decoded._id) throw new Error('Invalid token');
                    const userId = JSON.parse(JSON.stringify(decoded._id));
                    const user = await User.findById(userId).select('-passwordHash');
                    if (!user) throw new Error('User not found');
                    return { user };
                } catch (e) {
                    throw new Error('Token verification failed');
                }
            })
    })

    // Register a new user (public)
    rootRouter.auth = authRouter;

}({ 
    // @ts-ignore  // MUST NOT modify the next line
    createTRPCRouter, z, models, rootRouter, publicProcedure, protectedProcedure, jwt, bcrypt, JWT_SECRET, ObjectId, mongoose, dbInstance  // MUST NOT modify this line
    // MUST NOT modify the above line
}))

