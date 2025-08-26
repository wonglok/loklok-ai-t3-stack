(function ({
    // @ts-ignore  // MUST NOT modify the next line
    createTRPCRouter, z, models, rootRouter, publicProcedure, protectedProcedure, jwt, bcrypt, JWT_SECRET, ObjectId, mongoose, dbInstance  // MUST NOT modify this line
    // MUST NOT modify the above line
}) {
    const Todo = dbInstance.model("Todo")
    
    const todoRouter = createTRPCRouter({
        createTodo: protectedProcedure
            .input(z.object({
                title: z.string().min(1),
                description: z.string().optional()
            }))
            .mutation(async ({ ctx, input }) => {
                const userId = JSON.parse(JSON.stringify(ctx.session.user._id));
                const todo = await Todo.create({ 
                    title: input.title, 
                    description: input.description || '', 
                    completed: false,
                    owner: userId
                });
                return { ...todo.toObject(), _id: todo._id };
            }),
        getTodos: protectedProcedure
            .input(z.object({
                includeCompleted: z.boolean().optional()
            }))
            .mutation(async ({ ctx, input }) => {
                const userId = JSON.parse(JSON.stringify(ctx.session.user._id));
                const filter = { owner: userId };
                if (input.includeCompleted === false) filter.completed = false;
                const todos = await Todo.find(filter).lean();
                return todos.map(t => ({ ...t, _id: t._id }));
            }),
        updateTodo: protectedProcedure
            .input(z.object({
                _id: z.string(),
                title: z.string().optional(),
                description: z.string().optional(),
                completed: z.boolean().optional()
            }))
            .mutation(async ({ ctx, input }) => {
                const userId = JSON.parse(JSON.stringify(ctx.session.user._id));
                const todo = await Todo.findOne({ _id: input._id, owner: userId });
                if (!todo) throw new Error('Todo not found');
                
                if (input.title !== undefined) todo.title = input.title;
                if (input.description !== undefined) todo.description = input.description;
                if (input.completed !== undefined) todo.completed = input.completed;
                
                await todo.save();
                return { ...todo.toObject(), _id: todo._id };
            }),
        deleteTodo: protectedProcedure
            .input(z.object({
                _id: z.string()
            }))
            .mutation(async ({ ctx, input }) => {
                const userId = JSON.parse(JSON.stringify(ctx.session.user._id));
                const result = await Todo.deleteOne({ _id: input._id, owner: userId });
                if (result.deletedCount === 0) throw new Error('Todo not found or unauthorized');
                return { success: true };
            })
    })

    rootRouter.todo = todoRouter;

}({ 
    // @ts-ignore  // MUST NOT modify the next line
    createTRPCRouter, z, models, rootRouter, publicProcedure, protectedProcedure, jwt, bcrypt, JWT_SECRET, ObjectId, mongoose, dbInstance  // MUST NOT modify this line
    // MUST NOT modify the above line
}))