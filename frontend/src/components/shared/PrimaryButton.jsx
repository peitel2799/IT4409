import { Loader2 } from "lucide-react";

export default function PrimaryButton({ isLoading, icon: Icon, children, ...props }) {
  return (
    <button className="btn-primary" disabled={isLoading} {...props}>
      {isLoading ? (
        <Loader2 className="animate-spin w-4 h-4" />
      ) : (
        Icon && <Icon className="w-4 h-4" />
      )}
      {children}
    </button>
  );
}