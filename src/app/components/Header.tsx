import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useData } from "../context/DataContext";
import { BELT_NAMES_PT, getDegreeDisplayLabel } from "./BeltDisplay";
import {
  LogOut,
  CreditCard,
  LayoutDashboard,
  Users,
  Bell,
  Menu,
  X,
} from "lucide-react";

export const Header: React.FC = () => {
  const { currentUser, logout, students, switchProfile } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!currentUser) return null;

  const student = currentUser.studentId
    ? students.find((s) => s.id === currentUser.studentId)
    : null;

  const isAdmin = currentUser.role === "admin";
  const availableProfiles = currentUser.availableProfiles || [];

  const handleProfileSwitch = async (profileId: string) => {
    const profile = availableProfiles.find((p) => p.id === profileId);
    if (!profile) return;

    await switchProfile(profileId);
    navigate(profile.role === "admin" ? "/admin" : "/student");
    setMobileOpen(false);
  };

  const studentLinks = [
    { to: "/student", label: "Início", icon: <LayoutDashboard size={16} /> },
    {
      to: "/student/card",
      label: "Meu Cartão",
      icon: <CreditCard size={16} />,
    },
  ];

  const adminLinks = [
    { to: "/admin", label: "Painel", icon: <LayoutDashboard size={16} /> },
    { to: "/admin/students", label: "Alunos", icon: <Users size={16} /> },
    {
      to: "/admin/notifications",
      label: "Notificacoes",
      icon: <Bell size={16} />,
    },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  const isActive = (to: string) => location.pathname === to;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to={isAdmin ? "/admin" : "/student"}
          className="flex items-center gap-3"
        >
          <div>
            <div className="text-[#D10A11] font-black text-base tracking-widest uppercase leading-none">
              Gracie Barra
            </div>
            <div className="text-gray-500 text-[10px] tracking-wider uppercase leading-none mt-0.5">
              {isAdmin ? "Painel do Professor" : "Portal do Aluno"}
            </div>
          </div>
        </Link>

        {availableProfiles.length > 1 && (
          <div className="hidden md:flex flex-1 justify-center px-4">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-full max-w-full overflow-x-auto">
              {availableProfiles.map((profile) => {
                const active = profile.id === currentUser.id;

                return (
                  <button
                    key={profile.id}
                    onClick={() => handleProfileSwitch(profile.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      active
                        ? "bg-white text-[#D10A11] shadow"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                    title="Trocar de perfil"
                  >
                    {profile.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? isAdmin
                    ? "bg-[#003087] text-white"
                    : "bg-[#D10A11] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            {availableProfiles.length > 1 ? (
              <div className="flex items-center justify-end gap-1 mb-1 flex-wrap">
                {availableProfiles.map((profile) => {
                  const active = profile.id === currentUser.id;

                  return (
                    <button
                      key={profile.id}
                      onClick={() => handleProfileSwitch(profile.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                        active
                          ? "bg-[#003087] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title={`Trocar para ${profile.name}`}
                    >
                      {profile.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm font-semibold text-gray-900">
                {currentUser.name}
              </div>
            )}
            {student && (
              <div className="text-xs text-gray-500">
                {BELT_NAMES_PT[student.belt]} •{" "}
                {getDegreeDisplayLabel(
                  student.program,
                  student.belt,
                  student.degrees,
                )}
              </div>
            )}
            {isAdmin && (
              <div className="text-xs text-[#003087] font-medium">
                Administrador
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-[#D10A11] hover:bg-red-50 rounded-lg transition-colors text-sm"
            title="Sair"
          >
            <LogOut size={18} />
            <span className="hidden sm:block">Sair</span>
          </button>
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-500 hover:text-gray-900"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {availableProfiles.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {availableProfiles.map((profile) => {
                const active = profile.id === currentUser.id;

                return (
                  <button
                    key={profile.id}
                    onClick={() => handleProfileSwitch(profile.id)}
                    className={`px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      active
                        ? "bg-[#D10A11] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {profile.name}
                  </button>
                );
              })}
            </div>
          )}
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? isAdmin
                    ? "bg-[#003087] text-white"
                    : "bg-[#D10A11] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>
      )}

    </header>
  );
};
