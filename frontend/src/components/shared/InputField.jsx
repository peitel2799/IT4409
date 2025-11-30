export default function InputField({ label, icon: Icon, className = "", ...props }) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && <label className="section-label">{label}</label>}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input 
          className={`input-field ${Icon ? 'pl-10' : ''}`} 
          {...props} 
        />
      </div>
    </div>
  );
}