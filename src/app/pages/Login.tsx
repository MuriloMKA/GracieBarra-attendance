import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useData } from "../context/DataContext";
import { Lock, Mail, ArrowRight, Eye, EyeOff, KeyRound, ChevronDown } from "lucide-react";
import api from "../services/api";

export function LoginPage() {
  const { login } = useData();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Change password section
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [cpEmail, setCpEmail] = useState("");
  const [cpCurrent, setCpCurrent] = useState("");
  const [cpNew, setCpNew] = useState("");
  const [cpConfirm, setCpConfirm] = useState("");
  const [showCpCurrent, setShowCpCurrent] = useState(false);
  const [showCpNew, setShowCpNew] = useState(false);
  const [cpLoading, setCpLoading] = useState(false);
  const [cpError, setCpError] = useState("");
  const [cpSuccess, setCpSuccess] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setCpError("");
    if (cpNew !== cpConfirm) { setCpError("As senhas não coincidem."); return; }
    if (cpNew.length < 6) { setCpError("A nova senha deve ter pelo menos 6 caracteres."); return; }
    try {
      setCpLoading(true);
      // Login to get a token, then change password with it
      const { data } = await api.post("/auth/login", { email: cpEmail.trim(), password: cpCurrent });
      const token = data.user?.token || data.token;
      await api.post("/auth/change-password", { currentPassword: cpCurrent, newPassword: cpNew }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCpSuccess(true);
      setCpEmail(""); setCpCurrent(""); setCpNew(""); setCpConfirm("");
    } catch (err: any) {
      setCpError(err?.response?.data?.error || "Credenciais incorretas ou erro no servidor.");
    } finally {
      setCpLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Fallback visual: evita botao preso em "Entrando..." se a promise travar.
    const forceStopTimer = setTimeout(() => {
      setLoading(false);
      setError("Tempo de resposta excedido. Tente novamente.");
    }, 20000);

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
        clearTimeout(forceStopTimer);
        setLoading(false);
      });
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
          <div className="bg-white rounded-full shadow-2xl mb-5 w-28 h-28 flex items-center justify-center overflow-hidden">
            <img
              src="/images/logo.png"
              alt="Gracie Barra Logo"
              className="w-full h-full object-cover scale-110"
            />
          </div>
          <h1 className="text-white text-3xl font-black tracking-widest uppercase text-center">
            GRACIE BARRA MARAJOARA
          </h1>
          <p className="text-red-200 text-sm tracking-widest uppercase mt-1 text-center">
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
        </div>

        {/* Change Password Section */}
        <div className="bg-white/10 rounded-2xl shadow-lg mt-4 overflow-hidden">
          <button
            type="button"
            onClick={() => { setShowChangePwd(!showChangePwd); setCpError(""); setCpSuccess(false); }}
            className="w-full flex items-center justify-between px-6 py-4 text-white/80 hover:text-white hover:bg-white/10 transition-colors text-sm font-semibold"
          >
            <span className="flex items-center gap-2">
              <KeyRound size={16} />
              Precisa trocar sua senha?
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${showChangePwd ? "rotate-180" : ""}`}
            />
          </button>

          {showChangePwd && (
            <div className="bg-white px-6 py-5 border-t border-gray-100">
              {cpSuccess ? (
                <div className="text-center py-4">
                  <div className="text-green-600 font-black text-base mb-1">Senha alterada com sucesso!</div>
                  <p className="text-gray-500 text-sm">Faça login com sua nova senha.</p>
                  <button
                    onClick={() => { setCpSuccess(false); setShowChangePwd(false); }}
                    className="mt-4 px-4 py-2 bg-[#D10A11] text-white rounded-xl text-sm font-bold"
                  >
                    Fazer Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <p className="text-gray-500 text-xs mb-3">
                    Informe seu email, senha atual e a nova senha desejada.
                  </p>
                  {cpError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                      {cpError}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={cpEmail}
                        onChange={(e) => setCpEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D10A11]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Senha atual</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showCpCurrent ? "text" : "password"}
                        required
                        value={cpCurrent}
                        onChange={(e) => setCpCurrent(e.target.value)}
                        placeholder="Senha atual"
                        className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D10A11]"
                      />
                      <button type="button" onClick={() => setShowCpCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showCpCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nova senha</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showCpNew ? "text" : "password"}
                        required
                        value={cpNew}
                        onChange={(e) => setCpNew(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D10A11]"
                      />
                      <button type="button" onClick={() => setShowCpNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showCpNew ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Confirmar nova senha</label>
                    <input
                      type="password"
                      required
                      value={cpConfirm}
                      onChange={(e) => setCpConfirm(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D10A11]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={cpLoading}
                    className="w-full py-2.5 bg-[#003087] hover:bg-blue-900 text-white font-black rounded-xl text-sm shadow disabled:opacity-50 mt-1"
                  >
                    {cpLoading ? "Alterando..." : "Alterar Senha"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-red-200/50 text-xs mt-6">
          © {new Date().getFullYear()} Gracie Barra — Carlos Gracie Jr.
        </p>
      </div>
    </div>
  );
}
