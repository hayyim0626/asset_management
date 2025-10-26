import Image from "next/image";
import { AssetType } from "../types";

interface PropType {
  assetType: AssetType;
  src: string;
  imageWidth?: number;
  emojiSize?: "text-lg" | "text-3xl";
}

export function AssetImage(props: PropType) {
  const { assetType, src, imageWidth = 20, emojiSize = "text-lg" } = props;
  if (assetType === "cash") {
    return <span className={emojiSize}>{src}</span>;
  }
  return (
    <Image
      src={src}
      width={imageWidth}
      height={imageWidth}
      alt="asset_img"
      className="rounded-full"
    />
  );
}
