import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useData } from "../context/DataContext";
import { Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";

export function LoginPage() {
  const { login } = useData();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    login(email.trim(), password)
      .then((success) => {
        if (success) {
          const savedUser = localStorage.getItem("gb_current_user");
          if (savedUser) {
            const user = JSON.parse(savedUser);
            navigate(user.role === "admin" ? "/admin" : "/student");
          }
        } else {
          setError("Email ou senha incorretos. Tente novamente.");
        }
      })
      .catch(() => {
        setError("Erro ao conectar com o servidor. Verifique sua conexão.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const quickLogin = (em: string, pw: string) => {
    setEmail(em);
    setPassword(pw);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, #1a0000 0%, #6b0000 50%, #D10A11 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white rounded-full p-2 shadow-2xl mb-5 w-28 h-28 flex items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              className="h-full w-full"
              fill="currentColor"
            >
              <text
                x="50"
                y="60"
                fontSize="32"
                fontWeight="bold"
                textAnchor="middle"
                fill="#0EA5E9"
              >
                GB
              </text>
            </svg>
          </div>
          <h1 className="text-white text-3xl font-black tracking-widest uppercase">
            GRACIE BARRA
          </h1>
          <p className="text-red-200 text-sm tracking-widest uppercase mt-1">
            Sistema de Frequência Digital
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-gray-900 text-xl font-black mb-1">
            Entrar no sistema
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Use seu email e senha cadastrados.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D10A11] focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D10A11] focus:border-transparent text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#D10A11] hover:bg-red-700 text-white font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Access */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">
              Usuários de teste
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => quickLogin("admin@graciebarra.com", "admin123")}
                className="text-sm py-3 px-4 bg-[#003087] hover:bg-blue-900 text-white rounded-xl transition-colors font-bold flex items-center justify-between"
              >
                <span>👨‍🏫 Professor Admin</span>
                <span className="text-xs text-blue-200">admin</span>
              </button>
              <button
                onClick={() => quickLogin("joao@example.com", "aluno123")}
                className="text-sm py-3 px-4 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-medium flex items-center justify-between"
              >
                <span>🥋 João Silva</span>
                <span className="text-xs text-gray-500">Branca 1°</span>
              </button>
              <button
                onClick={() => quickLogin("maria@example.com", "aluno123")}
                className="text-sm py-3 px-4 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-medium flex items-center justify-between"
              >
                <span>🥋 Maria Santos</span>
                <span className="text-xs text-gray-500">Azul 2°</span>
              </button>
              <button
                onClick={() => quickLogin("carlos@example.com", "aluno123")}
                className="text-sm py-3 px-4 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-medium flex items-center justify-between"
              >
                <span>🥋 Carlos Oliveira</span>
                <span className="text-xs text-gray-500">Roxa</span>
              </button>
              <button
                onClick={() => quickLogin("pedro@example.com", "aluno123")}
                className="text-sm py-3 px-4 border-2 border-green-200 text-green-700 hover:bg-green-50 rounded-xl transition-colors font-medium flex items-center justify-between"
              >
                <span>👦 Pedro Costa (GBK)</span>
                <span className="text-xs text-green-600">Cinza 3°</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-red-200/50 text-xs mt-6">
          © {new Date().getFullYear()} Gracie Barra — Carlos Gracie Jr.
        </p>
      </div>
    </div>
  );
}
