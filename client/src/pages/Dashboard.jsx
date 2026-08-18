import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../store/authStore";
import { getTransactions, createTransaction, deleteTransaction } from "../api/transactions";

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ type: "expense", category: "", amount: "" });

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: getTransactions,
  });

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setForm({ type: "expense", category: "", amount: "" });
    },
  });

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

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-[#C77DFF]">Finora</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user?.name}</span>
            <button onClick={logout} className="text-sm text-[#9D4EDD] hover:underline">
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#9D4EDD]/30">
            <p className="text-xs text-gray-400 mb-1">Balance</p>
            <p className="text-xl font-semibold">${balance}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#9D4EDD]/30">
            <p className="text-xs text-gray-400 mb-1">Income</p>
            <p className="text-xl font-semibold text-green-400">${income}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#9D4EDD]/30">
            <p className="text-xs text-gray-400 mb-1">Expenses</p>
            <p className="text-xl font-semibold text-red-400">${expense}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1a1a1a] rounded-xl p-4 mb-6 border border-[#9D4EDD]/30 flex gap-2">
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="bg-black border border-[#9D4EDD]/50 rounded px-2 py-1 text-sm"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
            className="bg-black border border-[#9D4EDD]/50 rounded px-2 py-1 text-sm flex-1"
          />
          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
            className="bg-black border border-[#9D4EDD]/50 rounded px-2 py-1 text-sm w-24"
          />
          <button type="submit" className="bg-[#9D4EDD] hover:bg-[#C77DFF] px-4 py-1 rounded text-sm font-medium">
            Add
          </button>
        </form>

        <div className="bg-[#1a1a1a] rounded-xl border border-[#9D4EDD]/30">
          {isLoading && <p className="p-4 text-sm text-gray-400">Loading...</p>}
          {transactions?.length === 0 && <p className="p-4 text-sm text-gray-400">No transactions yet.</p>}
          {transactions?.map((t) => (
            <div key={t._id} className="flex justify-between items-center px-4 py-3 border-b border-[#9D4EDD]/10 last:border-0">
              <div>
                <p className="text-sm">{t.category}</p>
                <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={t.type === "income" ? "text-green-400" : "text-red-400"}>
                  {t.type === "income" ? "+" : "-"}${t.amount}
                </span>
                <button
                  onClick={() => deleteMutation.mutate(t._id)}
                  className="text-xs text-gray-500 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}