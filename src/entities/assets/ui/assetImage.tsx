import Image from "next/image";

interface PropType {
  assetType: "cash" | "crypto";
  image: string;
}

export function AssetImage(props: PropType) {
  const { assetType, image } = props;
  if (assetType === "cash") {
    return <span className="text-lg">{image}</span>;
  }
  return <Image src={image} width={20} height={20} alt="asset_img" className="rounded-full" />;
}
