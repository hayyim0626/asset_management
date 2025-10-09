import React from "react";
import { icons, type IconName } from "@/shared/assets/icons";

interface PropType {
  name: IconName;
  className?: string;
}

export function SvgIcon({ name, className = "w-5 h-5" }: PropType) {
  const Icon = icons[name];

  if (!Icon) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return <Icon className={className} />;
}
