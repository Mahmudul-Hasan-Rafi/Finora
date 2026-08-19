import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import useAuthStore from "../store/authStore";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/register", form);
      login(
        { _id: res.data._id, name: res.data.name, email: res.data.email },
        res.data.token
      );
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[--bg] text-[--text] flex items-center justify-center px-4 transition-colors">
      <div className="neo w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-[--accent] text-center mb-1">Finora</h1>
        <p className="text-sm text-[--text-muted] text-center mb-6">Create your account</p>

        {error && (
          <div className="neo-inset px-3 py-2 mb-4 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            className="neo-inset w-full px-4 py-2 text-sm bg-transparent outline-none placeholder:text-[--text-muted]"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="neo-inset w-full px-4 py-2 text-sm bg-transparent outline-none placeholder:text-[--text-muted]"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="neo-inset w-full px-4 py-2 text-sm bg-transparent outline-none placeholder:text-[--text-muted]"
          />
          <button
            type="submit"
            className="w-full bg-[--accent] hover:bg-[--accent-light] transition-colors text-white font-medium py-2 rounded-lg"
          >
            Register
          </button>
        </form>

        <p className="text-sm text-[--text-muted] text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[--accent] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}