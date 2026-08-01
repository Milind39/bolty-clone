import React, { useState, useEffect } from 'react';
import { Todo, FilterState, Priority } from './types';
import { TodoForm } from './components/TodoForm';
import { TodoItem } from './components/TodoItem';
import { Filters } from './components/Filters';
import { Stats } from './components/Stats';
import { ListTodo, CheckSquare, Sparkles } from 'lucide-react';

const INITIAL_TODOS: Todo[] = [
  {
    id: '1',
    title: 'Design website landing page',
    description: 'Create high fidelity wireframes using modern grid layouts and colors.',
    completed: false,
    priority: 'high',
    category: 'Work',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Groceries shopping',
    description: 'Milk, Eggs, Avocado, Whole grain bread, and fresh fruits.',
    completed: true,
    priority: 'low',
    category: 'Personal',
    dueDate: new Date().toISOString().split('T')[0], // today
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '3',
    title: 'Run 5 kilometers',
    description: 'Maintain pace at under 5:30 min/km.',
    completed: false,
    priority: 'medium',
    category: 'Health',
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], // in 2 days
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_CATEGORIES = ['Personal', 'Work', 'Health', 'Shopping', 'Finance'];

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('react_todos');
    return saved ? JSON.parse(saved) : INITIAL_TODOS;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('react_todo_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    category: 'all',
    priority: 'all',
    search: '',
    sortBy: 'createdAt',
  });

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('react_todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('react_todo_categories', JSON.stringify(categories));
  }, [categories]);

  // Handle adding todo
  const handleAddTodo = (newTodo: {
    title: string;
    description: string;
    priority: Priority;
    category: string;
    dueDate: string;
  }) => {
    const todo: Todo = {
      id: Date.now().toString(),
      title: newTodo.title,
      description: newTodo.description || undefined,
      completed: false,
      priority: newTodo.priority,
      category: newTodo.category,
      dueDate: newTodo.dueDate || undefined,
      createdAt: new Date().toISOString(),
    };

    setTodos((prev) => [todo, ...prev]);

    // Track/Add new category if not existing
    if (newTodo.category && !categories.includes(newTodo.category)) {
      setCategories((prev) => [...prev, newTodo.category]);
    }
  };

  // Toggle todo completion
  const handleToggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Delete single todo
  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  // Edit/Update a todo
  const handleEditTodo = (id: string, updatedTodo: Partial<Todo>) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, ...updatedTodo } : todo))
    );

    // If edited category is new, append it
    if (updatedTodo.category && !categories.includes(updatedTodo.category)) {
      setCategories((prev) => [...prev, updatedTodo.category]);
    }
  };

  // Clear completed todos
  const handleClearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  // Handle Filter updates
  const handleFilterChange = (updatedFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updatedFilters }));
  };

  // Filter & Sort logic
  const filteredTodos = todos
    .filter((todo) => {
      const matchStatus =
        filters.status === 'all' ||
        (filters.status === 'active' && !todo.completed) ||
        (filters.status === 'completed' && todo.completed);

      const matchCategory =
        filters.category === 'all' || todo.category === filters.category;

      const matchPriority =
        filters.priority === 'all' || todo.priority === filters.priority;

      const matchSearch =
        todo.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (todo.description || '').toLowerCase().includes(filters.search.toLowerCase());

      return matchStatus && matchCategory && matchPriority && matchSearch;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      if (filters.sortBy === 'priority') {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }

      // Default: createdAt desc (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const hasCompleted = todos.some((todo) => todo.completed);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* App Header */}
        <header className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-100">
              <ListTodo className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                TaskFlow <Sparkles className="h-5 w-5 text-indigo-500 fill-indigo-500" />
              </h1>
              <p className="text-sm font-medium text-gray-500">Your gorgeous task management & productivity hub</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-xs text-xs font-semibold text-gray-600">
            <CheckSquare className="h-4 w-4 text-green-500" /> Web-storage active
          </div>
        </header>

        {/* Dashboard Stats */}
        <Stats todos={todos} />

        {/* Left Form, Right Filter and List columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Create Task Column */}
          <div className="lg:col-span-5">
            <TodoForm onAdd={handleAddTodo} categories={categories} />
          </div>

          {/* List and Filters Column */}
          <div className="lg:col-span-7 space-y-4">
            <Filters
              filters={filters}
              onFilterChange={handleFilterChange}
              categories={categories}
              onClearCompleted={handleClearCompleted}
              hasCompleted={hasCompleted}
            />

            {/* Todo Items Container */}
            <div className="space-y-3">
              {filteredTodos.length > 0 ? (
                filteredTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    categories={categories}
                    onToggle={handleToggleTodo}
                    onDelete={handleDeleteTodo}
                    onEdit={handleEditTodo}
                  />
                ))
              ) : (
                <div className="text-center py-12 px-4 bg-white rounded-2xl border border-gray-100 shadow-xs text-gray-400">
                  <ListTodo className="h-10 w-10 mx-auto mb-3 text-gray-300 stroke-[1.5]" />
                  <p className="font-semibold text-sm text-gray-500 mb-1">No tasks matched your search or filters</p>
                  <p className="text-xs text-gray-400">Try creating a new task, clearing filters, or typing something else!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;