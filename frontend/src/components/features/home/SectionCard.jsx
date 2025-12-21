import { AutoScrollList } from "./HomeItems";

export default function SectionCard({
  title,
  subtitle,
  icon: Icon,
  image,
  bgColor = "bg-pink-300",
  borderColor = "border-pink-100",
  iconColor = "text-pink-600",
  iconBg = "bg-pink-100/80",
  scrollSpeed = "30s",
  items = [],
  renderItem,
}) {
  return (
    <div
      className={`relative h-full rounded-2xl border ${borderColor} ${bgColor} overflow-hidden
                  shadow-sm group transition-transform duration-500 hover:scale-[1.03]`}
    >
      {/* Background image + lớp mờ gradient */}
      {image && (
        <>
          <img
            src={image}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent" />
        </>
      )}

      {/* Scrollable items */}
      <div className="absolute top-4 bottom-28 left-0 right-0 px-4 z-10">
        {items.length > 0 ? (
          <AutoScrollList speed={scrollSpeed}>
            {items.map(renderItem)}
          </AutoScrollList>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            No Data
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-6 z-20">
        <div
          className={`${iconBg} backdrop-blur-md p-3 rounded-2xl w-fit mb-2 shadow-sm`}
        >
          <Icon size={24} className={iconColor} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}
