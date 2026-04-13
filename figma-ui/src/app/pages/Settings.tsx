import { motion } from "motion/react";
import { User, Bell, Shield, CircleHelp, LogOut } from "lucide-react";

export function Settings() {
  return (
    <div className="min-h-full bg-slate-50 relative pb-24">
      <div className="sticky top-0 z-40 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/50 px-5 pt-12 pb-4 transition-all">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">설정</h1>
        </motion.div>
      </div>

      <div className="p-5 flex flex-col gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">사용자 이름</h2>
            <p className="text-sm text-slate-500">user@example.com</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-slate-500 px-2 uppercase tracking-wider">계정</h3>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <button className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 border-b border-slate-100 transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-slate-400" />
                <span className="font-medium text-slate-700">알림 설정</span>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-slate-400" />
                <span className="font-medium text-slate-700">개인정보 보호</span>
              </div>
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col gap-2">
           <h3 className="text-sm font-semibold text-slate-500 px-2 uppercase tracking-wider">지원</h3>
           <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
             <button className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors">
               <div className="flex items-center gap-3">
                 <CircleHelp className="w-5 h-5 text-slate-400" />
                 <span className="font-medium text-slate-700">고객 센터</span>
               </div>
             </button>
           </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4">
           <button className="w-full flex items-center justify-center gap-2 p-4 bg-white rounded-2xl border border-red-100 shadow-sm text-red-500 font-semibold hover:bg-red-50 transition-colors">
             <LogOut className="w-5 h-5" />
             로그아웃
           </button>
        </motion.div>
      </div>
    </div>
  );
}
