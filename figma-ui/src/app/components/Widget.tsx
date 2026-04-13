import { NotionDB, ViewMode } from "../data/mockNotion";
import { LayoutList, LayoutGrid, KanbanSquare, MoreHorizontal, CheckSquare, Square } from "lucide-react";

interface WidgetProps {
  db: NotionDB;
  viewMode: ViewMode;
  onEdit?: () => void;
}

export function NotionWidget({ db, viewMode, onEdit }: WidgetProps) {
  const renderList = () => (
    <div className="flex flex-col gap-2.5 mt-4">
      {db.items.map(item => (
        <div key={item.id} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] active:bg-slate-50 transition-colors group relative">
          <div className="shrink-0 flex items-center justify-center">
             {item.status === 'Done' ? (
               <CheckSquare className="w-5 h-5 text-blue-500" />
             ) : (
               <Square className="w-5 h-5 text-slate-300" />
             )}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
             <span className={`text-[14px] leading-tight mb-1 truncate ${item.status === 'Done' ? 'text-slate-400 line-through' : 'text-slate-800 font-bold'}`}>
               {item.icon && <span className="mr-1.5">{item.icon}</span>}{item.title}
             </span>
             <div className="flex items-center gap-2">
               {item.tags && item.tags.length > 0 && (
                 <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md leading-none">{item.tags[0]}</span>
               )}
               {item.date && (
                 <span className={`text-[11px] font-medium ${item.date.includes('오늘') || item.date.includes('AM') || item.date.includes('PM') ? 'text-red-500' : 'text-slate-400'}`}>
                   {item.date}
                 </span>
               )}
             </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderBoard = () => {
    const statuses = ['To Do', 'In Progress', 'Done'];
    return (
      <div className="flex overflow-x-auto gap-3 mt-4 pb-2 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {statuses.map(status => (
          <div key={status} className="min-w-[260px] w-[260px] shrink-0 snap-start bg-[#F7F7F9] rounded-2xl p-3 border border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <div className="text-[13px] font-bold text-slate-600 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${status === 'Done' ? 'bg-green-500' : status === 'In Progress' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                {status}
              </div>
              <span className="text-[11px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                 {db.items.filter(i => i.status === status).length}
              </span>
            </div>
            
            <div className="flex flex-col gap-2.5">
              {db.items.filter(i => i.status === status).map(item => (
                <div key={item.id} className="bg-white p-3.5 rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col gap-2 active:scale-[0.98] transition-transform">
                  {item.cover && (
                     <div className="w-full h-24 bg-slate-100 rounded-lg overflow-hidden mb-1">
                        <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                     </div>
                  )}
                  <p className="text-[14px] text-slate-800 font-bold leading-snug">
                     {item.icon && <span className="mr-1.5">{item.icon}</span>}{item.title}
                  </p>
                  
                  <div className="flex justify-between items-center mt-1">
                     <div className="flex gap-1.5 flex-wrap">
                       {item.tags?.map(tag => (
                         <span key={tag} className="text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-100 px-1.5 py-0.5 rounded-md">{tag}</span>
                       ))}
                     </div>
                     {item.date && <span className="text-[10px] font-bold text-slate-400">{item.date}</span>}
                  </div>
                </div>
              ))}
              {db.items.filter(i => i.status === status).length === 0 && (
                 <div className="py-4 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[12px] font-bold text-slate-400">
                    Empty
                 </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderGallery = () => (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {db.items.map(item => (
        <div key={item.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] flex flex-col active:scale-[0.98] transition-transform relative group">
          {item.cover ? (
             <div className="w-full aspect-[4/3] bg-slate-100 overflow-hidden relative">
                <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
          ) : (
            <div className="w-full aspect-[4/3] bg-[#F7F7F9] flex flex-col items-center justify-center text-slate-300">
               <span className="text-4xl">{item.icon || db.icon}</span>
            </div>
          )}
          <div className="p-3.5 flex flex-col gap-1">
             <h4 className="text-[13px] font-bold text-slate-800 line-clamp-2 leading-snug">
               {!item.cover && item.icon && <span className="mr-1">{item.icon}</span>}
               {item.title}
             </h4>
             <div className="flex items-center justify-between mt-1">
               {item.tags && (
                 <span className="text-[11px] font-medium text-slate-400 line-clamp-1">{item.tags[0]}</span>
               )}
               {item.date && (
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">{item.date}</span>
               )}
             </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-3xl p-5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.05)] border border-slate-100/80 mb-2 font-sans relative overflow-hidden">
      {/* Subtle Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-50 to-transparent -z-10 rounded-bl-full" />
      
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-xl bg-[#F7F7F9] flex items-center justify-center text-lg border border-slate-100 shadow-sm">
             {db.icon}
           </div>
           <h3 className="font-extrabold text-[16px] text-slate-900 tracking-tight">{db.title}</h3>
        </div>
        <button onClick={onEdit} className="p-2 -mr-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-[#F7F7F9] transition-colors active:scale-90">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      
      {/* View Mode Indicator */}
      <div className="flex items-center gap-1.5 mt-2 ml-1 opacity-60">
        {viewMode === 'list' && <><LayoutList className="w-[14px] h-[14px] text-slate-500" /><span className="text-[11px] font-bold text-slate-500">List View</span></>}
        {viewMode === 'board' && <><KanbanSquare className="w-[14px] h-[14px] text-slate-500" /><span className="text-[11px] font-bold text-slate-500">Board View</span></>}
        {viewMode === 'gallery' && <><LayoutGrid className="w-[14px] h-[14px] text-slate-500" /><span className="text-[11px] font-bold text-slate-500">Gallery View</span></>}
      </div>

      <div className="mt-1">
        {viewMode === 'list' && renderList()}
        {viewMode === 'board' && renderBoard()}
        {viewMode === 'gallery' && renderGallery()}
      </div>
    </div>
  );
}
