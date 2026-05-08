import React from "react";
import { Link, isRouteErrorResponse, useRouteError } from "react-router";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";

export const RouteErrorPage: React.FC = () => {
  const error = useRouteError();

  let title = "Algo deu errado";
  let description = "A página encontrou um erro inesperado.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    description =
      error.status === 404
        ? "A rota solicitada não existe."
        : typeof error.data === "string"
          ? error.data
          : description;
  } else if (error instanceof Error) {
    description = error.message;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl shadow-2xl p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center border border-red-400/30">
            <AlertTriangle className="text-red-300" size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-black">{title}</h1>
            <p className="text-white/70 text-sm">Falha ao carregar a tela</p>
          </div>
        </div>

        <p className="text-white/85 leading-relaxed mb-6">{description}</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={18} />
            Recarregar
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
          >
            <Home size={18} />
            Ir para login
          </Link>
        </div>
      </div>
    </div>
  );
};
