import { AssetClient } from "@/features/assets/ui";
import { getAsset } from "@/entities/assets/api";
import { cookieUtils } from "@/shared/api/supabase/cookie";

interface FormState {
  success: boolean;
  error: string | null;
  data: any;
  message: string | null;
}

export default async function AssetsPage() {
  const { getAccessToken } = await cookieUtils();
  const res = await getAsset(getAccessToken() as string);

  const handleSubmit = async (prev: FormState, formData: FormData) => {
    "use server";

    const data = {
      assetType: formData.get("assetType"),
      symbol: formData.get("symbol"),
      amount: formData.get("amount"),
      averagePrice: formData.get("averagePrice")
    };
    console.log(data);
    return "";
  };

  return (
    <>
      <div className="min-h-screen bg-slate-950">
        <AssetClient handleSubmit={handleSubmit} data={res.data} />
      </div>
    </>
  );
}
