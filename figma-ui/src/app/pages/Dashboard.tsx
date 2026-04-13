import { useState } from "react";
import { NotionWidget } from "../components/Widget";
import { MOCK_DATABASES, RECENT_DOCS, WidgetConfig } from "../data/mockNotion";
import { Plus, Search, Bell } from "lucide-react";
import { AddWidgetModal } from "../components/AddWidgetModal";
import { motion } from "motion/react";

const CATEGORIES = ['All', 'Work', 'Life', 'Study', 'Health'];

export function Dashboard() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([
    { id: 'w1', dbId: 'db_tasks_02', title: '할 일 관리 (오늘)', icon: '✅', viewMode: 'list' },
    { id: 'w2', dbId: 'db_projects_01', title: '프로젝트 및 목표', icon: '🎯', viewMode: 'gallery' }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const handleAddWidget = (config: Omit<WidgetConfig, 'id'>) => {
    const newWidget = { ...config, id: `w_${Date.now()}` };
    setWidgets([newWidget, ...widgets]);
    setIsModalOpen(false);
  };

  const handleUpdateWidget = (config: WidgetConfig) => {
    setWidgets(widgets.map(w => w.id === config.id ? config : w));
    setEditingWidget(null);
  };

  const handleDeleteWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
    setEditingWidget(null);
  };

  return (
    <div className="min-h-full pb-24 bg-[#F7F7F9] relative font-sans">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#F7F7F9]/90 backdrop-blur-xl px-5 pt-12 pb-3 flex justify-between items-center">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
             <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" alt="User" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">Hi, Jayden 👋</h1>
            <span className="text-xs text-slate-500 font-medium">Work & Life Dashboard</span>
          </div>
        </motion.div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 text-slate-600 active:scale-95 transition-transform">
             <Search className="w-[18px] h-[18px]" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 text-slate-600 active:scale-95 transition-transform">
             <Bell className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="px-5 py-2 overflow-x-auto hide-scrollbar flex gap-2 snap-x snap-mandatory">
         {CATEGORIES.map(cat => (
           <button 
             key={cat}
             onClick={() => setActiveCategory(cat)}
             className={`snap-start whitespace-nowrap px-4 py-2 rounded-full text-[13px] font-bold transition-colors shadow-sm ${
               activeCategory === cat 
                 ? 'bg-slate-900 text-white' 
                 : 'bg-white text-slate-500 border border-slate-100'
             }`}
           >
             {cat}
           </button>
         ))}
      </div>

      {/* Recent Documents */}
      <div className="px-5 mt-4 mb-2">
         <h2 className="text-sm font-bold text-slate-800 mb-3 px-1">최근 항목</h2>
         <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 -mb-4 snap-x snap-mandatory">
            {RECENT_DOCS.map((doc, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={doc.id} 
                className="snap-start shrink-0 w-[140px] bg-white p-3.5 rounded-2xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] border border-slate-100/60 active:scale-95 transition-transform flex flex-col gap-2"
              >
                 <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{doc.icon}</span>
                 </div>
                 <h3 className="text-[13px] font-bold text-slate-800 line-clamp-2 leading-snug">{doc.title}</h3>
                 <span className="text-[11px] font-medium text-slate-400 mt-auto">{doc.dbTitle}</span>
              </motion.div>
            ))}
         </div>
      </div>

      {/* Widgets Area */}
      <div className="p-5 pt-6 flex flex-col gap-5">
         <div className="flex justify-between items-end px-1 mb-1">
           <h2 className="text-sm font-bold text-slate-800">내 대시보드 위젯</h2>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="text-xs font-bold text-blue-600 flex items-center gap-1 active:opacity-70"
           >
             <Plus className="w-3.5 h-3.5" /> 위젯 추가
           </button>
         </div>

        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-100">
             <h3 className="text-[15px] font-bold text-slate-800 mb-1">위젯이 없습니다</h3>
             <p className="text-[13px] text-slate-500 mb-5">상단의 위젯 추가 버튼을 눌러주세요.</p>
          </div>
        ) : (
          widgets.map((widget, i) => {
            const db = MOCK_DATABASES.find(d => d.id === widget.dbId);
            if (!db) return null;
            return (
              <motion.div
                key={widget.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
              >
                <NotionWidget 
                  db={db} 
                  viewMode={widget.viewMode} 
                  onEdit={() => setEditingWidget(widget)}
                />
              </motion.div>
            );
          })
        )}
      </div>

      <AddWidgetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddWidget}
      />
      
      {editingWidget && (
         <AddWidgetModal 
           isOpen={true} 
           onClose={() => setEditingWidget(null)} 
           onUpdate={handleUpdateWidget}
           onDelete={() => handleDeleteWidget(editingWidget.id)}
           initialConfig={editingWidget}
         />
      )}
    </div>
  );
}
