import { Calendar as CalendarIcon } from 'lucide-react';

export default function DateWidget() {
  const today = new Date();
  const date = today.getDate();
  const month = today.toLocaleString('default', { month: 'short' });
  const year = today.getFullYear();
  const dayName = today.toLocaleString('default', { weekday: 'long' });

  return (
    <div className="flex-[0.35] bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
         <div className="p-3 bg-pink-50 text-pink-500 rounded-2xl">
           <CalendarIcon size={24} />
         </div>
         <span className="text-gray-400 font-medium">{month} {year}</span>
      </div>
      <div>
        <h2 className="text-5xl font-bold text-gray-800">{date}</h2>
        <p className="text-gray-500 font-medium mt-1">{dayName}</p>
      </div>
    </div>
  );
}