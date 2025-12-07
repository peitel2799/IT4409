import { AutoScrollList } from "./HomeItems"; 

export default function SectionCard({ 
  title, subtitle, icon: Icon, image, 
  bgColor = "bg-pink-300", borderColor = "border-pink-100", 
  iconColor = "text-pink-600", iconBg = "bg-pink-100/80", 
  scrollSpeed = "30s", items = [], renderItem 
}) {
  return (
    <div className={`h-full ${bgColor} rounded-[32px] shadow-sm relative overflow-hidden group border ${borderColor}`}>
       <img src={image} className="absolute inset-0 w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-700" alt="" />
       <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent"></div>

       <div className="absolute top-4 bottom-28 left-0 right-0 px-4 z-10">
           {items.length > 0 ? (
               <AutoScrollList speed={scrollSpeed}>
                   {items.map(renderItem)}
               </AutoScrollList>
           ) : (
               <div className="flex h-full items-center justify-center text-gray-500 text-sm font-medium">No Data</div>
           )}
       </div>

       <div className="absolute bottom-6 left-6 z-20">
            <div className={`${iconBg} backdrop-blur-md p-3 rounded-2xl w-fit mb-2 shadow-sm`}>
               <Icon size={24} className={iconColor} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
            <p className="text-gray-500 text-sm font-medium">{subtitle}</p>
       </div>
    </div>
  );
}