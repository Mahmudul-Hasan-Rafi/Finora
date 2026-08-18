import api from "./axios";

export const getBudgets = async () => {
  const res = await api.get("/budgets");
  return res.data;
};

export const setBudget = async (data) => {
  const res = await api.post("/budgets", data);
  return res.data;
};

export const deleteBudget = async (id) => {
  const res = await api.delete(`/budgets/${id}`);
  return res.data;
};