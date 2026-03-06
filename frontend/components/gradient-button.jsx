export default function GradientButton({ children, isLoading, className="", ...props}) {
  return (
    <button
     {...props}
      className={`h-12 w-full rounded-lg font-semibold text-primary-foreground transition-all 
        duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-default 
        bg-linear-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/20 cursor-pointer ${className}`}
    >
      {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
    </button>
  );
}
