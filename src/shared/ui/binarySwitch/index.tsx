"use client";

type BinarySwitchValue = string;

interface PropType<T extends BinarySwitchValue> {
  leftLabel: string;
  rightLabel: string;
  leftValue: T;
  rightValue: T;
  value: T;
  onChange: (value: T) => void;
}

export function BinarySwitch<T extends BinarySwitchValue>({
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  value,
  onChange
}: PropType<T>) {
  const isRightSelected = value === rightValue;

  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(leftValue)}
        className={`text-xs font-medium transition-colors ${
          !isRightSelected ? "text-white" : "text-slate-400"
        }`}
      >
        {leftLabel}
      </button>
      <button
        type="button"
        role="switch"
        aria-checked={isRightSelected}
        aria-label={`${leftLabel} / ${rightLabel}`}
        onClick={() => onChange(isRightSelected ? leftValue : rightValue)}
        className={`relative h-8 w-16 rounded-full transition-colors ${
          isRightSelected ? "bg-green-500/90" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
            isRightSelected ? "translate-x-9" : "translate-x-1"
          }`}
        />
      </button>
      <button
        type="button"
        onClick={() => onChange(rightValue)}
        className={`text-xs font-medium transition-colors ${
          isRightSelected ? "text-white" : "text-slate-400"
        }`}
      >
        {rightLabel}
      </button>
    </div>
  );
}
