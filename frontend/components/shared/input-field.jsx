import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function InputField({
  type = "text",
  name,
  setError,
  Icon,
  className = "",
  placeholder,
  value,
  onChange,
  autoComplete,
  required = false,
  spellCheck = false,
  autoCapitalize = "off",
  ...props
}) {
  const [toggled, setToggled] = useState("password");
  return (
    <div>
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      )}
      <input
        {...props}
        type={type === "password" ? toggled : type }
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        spellCheck={spellCheck}
        autoCapitalize={autoCapitalize}
        className={`w-full h-12 rounded-lg border border-border/40 bg-input/60 px-4 py-3 ${
          Icon ? "pl-12" : ""
        } text-foreground placeholder-muted-foreground/90 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-input/80 ${className}`}
      />
      {type === "password" && (
          <button
            type="button"
            onClick={() => {
              setToggled(toggled === "password" ? "text" : "password");
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1} // this means we can't focus on this button by pressing tab on the keyboard
          >
            {toggled === "text" ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
    </div>
        <p className="text-sm mt-1 text-red-500">{setError}</p>
  </div>
  );
}
