import { Outlet, NavLink } from "react-router";
import { Home, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function RootLayout() {
  return (
    <div className="flex flex-col h-screen max-h-[100dvh] w-full bg-[#F7F7F9] overflow-hidden font-sans text-slate-900">
      <main className="flex-1 overflow-y-auto w-full max-w-md mx-auto relative bg-[#F7F7F9] sm:border-x border-slate-200 sm:shadow-xl shadow-slate-200">
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>

      <div className="flex justify-center w-full bg-white/80 backdrop-blur-xl border-t border-slate-200 px-6 pb-6 pt-2 absolute bottom-0 max-w-md mx-auto left-0 right-0 z-50">
        <div className="flex w-full justify-around items-center">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all active:scale-95 ${
                isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              }`
            }
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium tracking-wide">홈</span>
          </NavLink>
          
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all active:scale-95 ${
                isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              }`
            }
          >
            <Settings className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium tracking-wide">설정</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
}
