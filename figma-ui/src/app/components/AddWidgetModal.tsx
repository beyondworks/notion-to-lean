import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, ChevronRight, Check, Trash2, LayoutList, KanbanSquare, LayoutGrid, PlugZap } from "lucide-react";
import { MOCK_DATABASES, ViewMode, WidgetConfig, NotionDB } from "../data/mockNotion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (config: Omit<WidgetConfig, "id">) => void;
  onUpdate?: (config: WidgetConfig) => void;
  onDelete?: () => void;
  initialConfig?: WidgetConfig;
}

export function AddWidgetModal({ isOpen, onClose, onAdd, onUpdate, onDelete, initialConfig }: Props) {
  const [step, setStep] = useState<"connect" | "select-db" | "config">("select-db");
  const [isConnected, setIsConnected] = useState(false);
  const [selectedDbId, setSelectedDbId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  useEffect(() => {
    if (isOpen) {
      if (initialConfig) {
        setSelectedDbId(initialConfig.dbId);
        setViewMode(initialConfig.viewMode);
        setStep("config");
      } else {
        setStep(isConnected ? "select-db" : "connect");
        setSelectedDbId(null);
        setViewMode("list");
      }
    }
  }, [isOpen, initialConfig, isConnected]);

  const handleConnect = () => {
    setTimeout(() => {
      setIsConnected(true);
      setStep("select-db");
    }, 800);
  };

  const selectedDb = MOCK_DATABASES.find(db => db.id === selectedDbId);

  const handleSave = () => {
    if (!selectedDb) return;
    if (initialConfig && onUpdate) {
      onUpdate({ ...initialConfig, dbId: selectedDb.id, title: selectedDb.title, icon: selectedDb.icon, viewMode });
    } else if (onAdd) {
      onAdd({ dbId: selectedDb.id, title: selectedDb.title, icon: selectedDb.icon, viewMode });
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center p-0 sm:p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[85vh] sm:h-[600px] overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-100 shrink-0">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                {step === "connect" && "노션 연결"}
                {step === "select-db" && "데이터베이스 선택"}
                {step === "config" && (initialConfig ? "위젯 수정" : "위젯 설정")}
              </h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
              {step === "connect" && (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                   <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-blue-100">
                      <PlugZap className="w-10 h-10" />
                   </div>
                   <h3 className="text-xl font-bold text-slate-900 mb-2">노션 계정 연결</h3>
                   <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                     대시보드에 노션 데이터베이스를<br/>위젯으로 추가하려면 연결이 필요합니다.
                   </p>
                   <button 
                     onClick={handleConnect}
                     className="w-full bg-slate-900 text-white font-semibold py-4 rounded-2xl shadow-md active:scale-95 transition-all text-sm"
                   >
                     노션 로그인 및 허용
                   </button>
                </div>
              )}

              {step === "select-db" && (
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="데이터베이스 검색..." 
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    />
                  </div>
                  
                  <div className="mt-2 space-y-2">
                    <div className="text-xs font-semibold text-slate-400 px-1 mb-2">최근 데이터베이스</div>
                    {MOCK_DATABASES.map(db => (
                      <button
                        key={db.id}
                        onClick={() => {
                          setSelectedDbId(db.id);
                          setViewMode(db.availableViews[0] || 'list');
                          setStep("config");
                        }}
                        className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm active:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{db.icon}</span>
                          <span className="font-semibold text-slate-800">{db.title}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === "config" && selectedDb && (
                <div className="flex flex-col gap-6 h-full">
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                     <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl border border-slate-100/50">
                       {selectedDb.icon}
                     </div>
                     <div>
                       <h3 className="font-bold text-slate-800">{selectedDb.title}</h3>
                       <button onClick={() => setStep("select-db")} className="text-xs text-blue-500 font-medium mt-1 hover:underline">다른 DB 선택</button>
                     </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h4 className="text-sm font-bold text-slate-800 px-1">보기 모드</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'list', icon: LayoutList, label: '목록' },
                        { id: 'board', icon: KanbanSquare, label: '보드' },
                        { id: 'gallery', icon: LayoutGrid, label: '갤러리' }
                      ].filter(v => selectedDb.availableViews.includes(v.id as ViewMode)).map(mode => (
                        <button
                          key={mode.id}
                          onClick={() => setViewMode(mode.id as ViewMode)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                            viewMode === mode.id 
                              ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' 
                              : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <mode.icon className={`w-6 h-6 ${viewMode === mode.id ? 'text-blue-500' : 'text-slate-400'}`} />
                          <span className={`text-xs font-semibold ${viewMode === mode.id ? 'text-blue-600' : 'text-slate-600'}`}>{mode.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-6 flex flex-col gap-3 pb-6">
                    <button 
                      onClick={handleSave}
                      className="w-full bg-slate-900 text-white font-semibold py-4 rounded-2xl shadow-md active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" /> 
                      {initialConfig ? "수정 완료" : "대시보드에 추가"}
                    </button>
                    {initialConfig && onDelete && (
                      <button 
                        onClick={onDelete}
                        className="w-full bg-white border border-red-100 text-red-500 font-semibold py-4 rounded-2xl shadow-sm active:bg-red-50 transition-all text-sm flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-5 h-5" /> 
                        위젯 삭제
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
