"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/app/api/auth/register/route.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Error al registrar");
      return;
    }

    router.push("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md p-6 rounded-md space-y-4 w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold text-center">Registrarse</h2>

        <input
          type="text"
          name="username"
          placeholder="Usuario"
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Correo"
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-orange-500 text-white w-full py-2 rounded hover:bg-orange-600"
        >
          Crear cuenta
        </button>

        <p className="text-center text-sm">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-orange-500 font-bold">
            Iniciar sesión
          </a>
        </p>
      </form>
    </div>
  );
}
