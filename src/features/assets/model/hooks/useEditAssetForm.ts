import { useEffect, useState, useActionState } from "react";
import { INITIAL_STATE } from "@/features/assets/lib/consts";
import { FormState } from "@/shared/types";
import toast from "react-hot-toast";

type EditType = "ADD" | "REMOVE" | "DELETE";

interface UseEditAssetFormProps {
  isOpen: boolean;
  handleAddAsset: (prevState: FormState, formData: FormData) => Promise<FormState>;
  handleRemoveAsset: (prevState: FormState, formData: FormData) => Promise<FormState>;
  onClose: () => void;
}

export function useEditAssetForm({
  isOpen,
  handleAddAsset,
  handleRemoveAsset,
  onClose
}: UseEditAssetFormProps) {
  const [editAction, setEditAction] = useState<EditType>("ADD");

  const [_addState, addFormAction, isAddPending] = useActionState(
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

  const [_removeState, removeFormAction, isRemovePending] = useActionState(
    async (prevState: FormState, formData: FormData) => {
      const result = await handleRemoveAsset(prevState, formData);
      if (result.success) {
        onClose();
        toast.success(result.message);
      }
      return result;
    },
    INITIAL_STATE
  );

  useEffect(() => {
    if (!isOpen) setEditAction("ADD");
  }, [isOpen]);

  return {
    editAction,
    isAddPending,
    isRemovePending,
    setEditAction,
    addFormAction,
    removeFormAction
  };
}
