import { create } from 'zustand';

const useTodoStore = create((set, get) => ({
  todos: [],
  loading: false,

  fetchTodos: async () => {
    set({ loading: true });
    try {
      const res = await window.trpcSDK.client.app.todo.getTodos.mutate({
        includeCompleted: false,
      });
      set({ todos: res.map((t) => ({ ...t, _id: t._id })) });
    } catch (_) {
      // handle error silently
    } finally {
      set({ loading: false });
    }
  },

  createTodo: async ({ title, description }) => {
    try {
      const res = await window.trpcSDK.client.app.todo.createTodo.mutate({
        title,
        description,
      });
      set((state) => ({
        todos: [...state.todos, { ...res, _id: res._id }],
      }));
    } catch (_) {}
  },

  updateTodo: async ({ _id, title, description, completed }) => {
    try {
      const res = await window.trpcSDK.client.app.todo.updateTodo.mutate({
        _id,
        title,
        description,
        completed,
      });
      set((state) => ({
        todos: state.todos.map((t) =>
          t._id === _id ? { ...res, _id: res._id } : t
        ),
      }));
    } catch (_) {}
  },

  deleteTodo: async ({ _id }) => {
    try {
      await window.trpcSDK.client.app.todo.deleteTodo.mutate({ _id });
      set((state) => ({
        todos: state.todos.filter((t) => t._id !== _id),
      }));
    } catch (_) {}
  },
}));

export default useTodoStore;