import useAuthStore from "../store/authStore";

export default function Dashboard() {
  const { user, logout } = useAuthStore();

  return (
    <div style={{ maxWidth: "600px", margin: "80px auto" }}>
      <h2>Welcome, {user?.name}</h2>
      <p>Email: {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}