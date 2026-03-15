import { useEffect, useState, useActionState } from "react";
import { INITIAL_STATE } from "@/features/assets/lib/consts";
import { FormState } from "@/shared/types";
import toast from "react-hot-toast";

type EditType = "ADD" | "REMOVE" | "DELETE" | "EDIT";

interface UseEditAssetFormProps {
  isOpen: boolean;
  handleAddAsset: (prevState: FormState, formData: FormData) => Promise<FormState>;
  handleRemoveAsset: (prevState: FormState, formData: FormData) => Promise<FormState>;
  handleEditAvgPrice: (prevState: FormState, formData: FormData) => Promise<FormState>;
  onClose: () => void;
}

export function useEditAssetForm({
  isOpen,
  handleAddAsset,
  handleRemoveAsset,
  handleEditAvgPrice,
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

  const [_editState, editFormAction, isEditPending] = useActionState(
    async (prevState: FormState, formData: FormData) => {
      const result = await handleEditAvgPrice(prevState, formData);
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
    isEditPending,
    setEditAction,
    addFormAction,
    removeFormAction,
    editFormAction
  };
}
