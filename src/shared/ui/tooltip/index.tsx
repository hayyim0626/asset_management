import type { ReactNode } from "react";

interface PropType {
  children: ReactNode;
  content: ReactNode;
  width?: string;
}

export function Tooltip({ children, content, width = "w-64" }: PropType) {
  return (
    <div className="relative group">
      <span className="text-slate-500 cursor-help">{children}</span>
      <div
        className={`absolute left-0 top-full mt-1 z-50 ${width} p-3 bg-slate-700 border border-slate-600 rounded-lg shadow-lg text-xs text-slate-300 space-y-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all`}
      >
        {content}
      </div>
    </div>
  );
}
