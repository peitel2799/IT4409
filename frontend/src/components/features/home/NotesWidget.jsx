import { StickyNote, Plus } from 'lucide-react';

export default function NotesWidget({ data = [] }) {
  return (
    <div className="flex-[0.65] bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden hover:shadow-md transition-all">
       <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <StickyNote className="text-yellow-500" size={20}/>
            <h3 className="font-bold text-lg">My Notes</h3>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Plus size={18} /></button>
       </div>
       <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {data.length > 0 ? (
             data.map(note => (
                <div key={note.id} className="p-4 bg-[#FDFCF5] rounded-2xl border border-yellow-100/50">
                  <p className="font-semibold text-gray-700 text-sm">{note.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{note.time}</p>
                </div>
             ))
          ) : (
            <p className="text-gray-400 text-sm text-center mt-10">No notes yet</p>
          )}
       </div>
    </div>
  );
}