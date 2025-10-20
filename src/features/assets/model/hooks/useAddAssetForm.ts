import { useEffect, useState, useActionState } from "react";
import { INITIAL_STATE } from "@/features/assets/lib/consts";
import type { AssetType } from "@/entities/assets/types";
import { FormState } from "@/shared/types";
import toast from "react-hot-toast";

interface PropType {
  isOpen: boolean;
  handleAddAsset: (prevState: FormState, formData: FormData) => Promise<FormState>;
  onClose: () => void;
  setAssetType: (type: AssetType | null) => void;
  setIsFirstAdd: (val: boolean) => void;
}

export function useAddAssetForm({
  isOpen,
  handleAddAsset,
  onClose,
  setAssetType,
  setIsFirstAdd
}: PropType) {
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [_, addFormAction, isAddPending] = useActionState(
    async (prevState: FormState, formData: FormData) => {
      const result = await handleAddAsset(prevState, formData);
      if (result.success) {
        onClose();
        toast.success(result.message);
      }
      return result;
    },
    INITIAL_STATE
  );

  useEffect(() => {
    if (!isOpen) {
      setAssetType(null);
      setIsFirstAdd(false);
      setSelectedAsset("");
      setSelectedCategory("");
    }
  }, [isOpen, setAssetType, setIsFirstAdd]);

  const handleCurrencySelect = (currencyCode: string) => {
    setSelectedAsset(currencyCode);
  };

  const handleCategorySelect = (code: string) => {
    setSelectedCategory(code);
  };

  return {
    selectedAsset,
    selectedCategory,
    isAddPending,
    addFormAction,
    handleCurrencySelect,
    handleCategorySelect
  };
}
