import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../store/authStore";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getBudgets, setBudget, deleteBudget } from "../api/budgets";
import { getTransactions, createTransaction, deleteTransaction, updateTransaction } from "../api/transactions";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ type: "expense", category: "", amount: "" });
  const [budgetForm, setBudgetForm] = useState({ category: "", limit: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ type: "", category: "", amount: "" });

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: getTransactions,
  });

  const { data: budgets } = useQuery({
    queryKey: ["budgets"],
    queryFn: getBudgets,
  });

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setForm({ type: "expense", category: "", amount: "" });
    },
  });

  const budgetMutation = useMutation({
    mutationFn: setBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setBudgetForm({ category: "", limit: "" });
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setEditingId(null);
    },
  });

  const startEdit = (t) => {
    setEditingId(t._id);
    setEditForm({ type: t.type, category: t.category, amount: t.amount });
  };

  const handleEditSubmit = (e, id) => {
    e.preventDefault();
    updateMutation.mutate({ id, data: { ...editForm, amount: Number(editForm.amount) } });
  };

  const handleBudgetSubmit = (e) => {
    e.preventDefault();
    budgetMutation.mutate({ ...budgetForm, limit: Number(budgetForm.limit) });
  };

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({ ...form, amount: Number(form.amount) });
  };

  const income = transactions?.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0) || 0;
  const expense = transactions?.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0) || 0;
  const balance = income - expense;

  const categoryData = Object.values(
    (transactions?.filter((t) => t.type === "expense") || []).reduce((acc, t) => {
      const key = t.category.trim().toLowerCase();
      if (!acc[key]) acc[key] = { name: key, value: 0 };
      acc[key].value += t.amount;
      return acc;
    }, {})
  );

  const COLORS = ["#9D4EDD", "#C77DFF", "#7B2CBF", "#5A189A", "#3C096C", "#E0AAFF"];

  return (
    <div className="min-h-screen bg-(--bg) text-(--text) transition-colors">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="neo p-4">
            <p className="text-xs text-(--text-muted) mb-1">Balance</p>
            <p className="text-xl font-semibold">${balance}</p>
          </div>
          <div className="neo p-4">
            <p className="text-xs text-(--text-muted) mb-1">Income</p>
            <p className="text-xl font-semibold text-green-500">${income}</p>
          </div>
          <div className="neo p-4">
            <p className="text-xs text-(--text-muted) mb-1">Expenses</p>
            <p className="text-xl font-semibold text-red-500">${expense}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="neo p-4 mb-6 flex gap-2">
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="neo-inset px-2 py-1 text-sm bg-transparent"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
            className="neo-inset px-2 py-1 text-sm flex-1 bg-transparent"
          />
          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
            className="neo-inset px-2 py-1 text-sm w-24 bg-transparent"
          />
          <button type="submit" className="bg-(--accent) hover:bg-(--accent-light) px-4 py-1 rounded-lg text-sm font-medium text-white">
            Add
          </button>
        </form>

        {categoryData.length > 0 && (
          <div className="neo p-4 mb-6">
            <p className="text-sm text-(--text-muted) mb-2">Spending by category</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.name}: $${entry.value}`}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--accent)" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="neo p-4 mb-6">
          <p className="text-sm text-(--text-muted) mb-2">Budgets</p>
          <form onSubmit={handleBudgetSubmit} className="flex gap-2 mb-3">
            <input
              placeholder="Category"
              value={budgetForm.category}
              onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
              required
              className="neo-inset px-2 py-1 text-sm flex-1 bg-transparent"
            />
            <input
              type="number"
              placeholder="Limit"
              value={budgetForm.limit}
              onChange={(e) => setBudgetForm({ ...budgetForm, limit: e.target.value })}
              required
              className="neo-inset px-2 py-1 text-sm w-24 bg-transparent"
            />
            <button type="submit" className="bg-(--accent) hover:bg-(--accent-light) px-4 py-1 rounded-lg text-sm font-medium text-white">
              Set
            </button>
          </form>
          {budgets?.map((b) => {
            const spent = categoryData.find(
              (c) => c.name === b.category.trim().toLowerCase()
            )?.value || 0;
            const pct = Math.min((spent / b.limit) * 100, 100);
            return (
              <div key={b._id} className="mb-2">
                <div className="flex justify-between text-xs text-(--text-muted) mb-1">
                  <span>{b.category}</span>
                  <div className="flex items-center gap-2">
                    <span>${spent} / ${b.limit}</span>
                    <button
                      onClick={() => deleteBudgetMutation.mutate(b._id)}
                      className="text-(--text-muted) hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="neo-inset h-2 overflow-hidden">
                  <div
                    className={`h-2 ${pct >= 100 ? "bg-red-500" : "bg-(--accent)"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="neo">
          {isLoading && <p className="p-4 text-sm text-(--text-muted)">Loading...</p>}
          {transactions?.length === 0 && <p className="p-4 text-sm text-(--text-muted)">No transactions yet.</p>}
          {transactions?.map((t) =>
            editingId === t._id ? (
              <form
                key={t._id}
                onSubmit={(e) => handleEditSubmit(e, t._id)}
                className="flex gap-2 items-center px-4 py-3 border-b border-(--shadow-dark)/20 last:border-0"
              >
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  className="neo-inset px-2 py-1 text-sm bg-transparent"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <input
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  required
                  className="neo-inset px-2 py-1 text-sm flex-1 bg-transparent"
                />
                <input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  required
                  className="neo-inset px-2 py-1 text-sm w-24 bg-transparent"
                />
                <button type="submit" className="text-xs text-green-500 hover:underline">Save</button>
                <button type="button" onClick={() => setEditingId(null)} className="text-xs text-(--text-muted) hover:underline">Cancel</button>
              </form>
            ) : (
              <div key={t._id} className="flex justify-between items-center px-4 py-3 border-b border-(--shadow-dark)/20 last:border-0">
                <div className="cursor-pointer" onClick={() => startEdit(t)}>
                  <p className="text-sm">{t.category}</p>
                  <p className="text-xs text-(--text-muted)">{new Date(t.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={t.type === "income" ? "text-green-500" : "text-red-500"}>
                    {t.type === "income" ? "+" : "-"}${t.amount}
                  </span>
                  <button
                    onClick={() => deleteMutation.mutate(t._id)}
                    className="text-xs text-(--text-muted) hover:text-red-400"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}