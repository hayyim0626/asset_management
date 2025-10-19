import { useEffect, useState, useActionState } from "react";
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

  const [addState, addFormAction, isAddPending] = useActionState(handleAddAsset, {
    success: false,
    error: null,
    message: null,
    date: Date.now()
  });

  const [removeState, removeFormAction, isRemovePending] = useActionState(handleRemoveAsset, {
    success: false,
    error: null,
    message: null,
    date: Date.now()
  });

  useEffect(() => {
    if (!isOpen) setEditAction("ADD");
  }, [isOpen]);

  useEffect(() => {
    if (addState.success && addState.date) {
      onClose();
      toast.success(addState.message);
    }
  }, [addState.success, addState.date, onClose]);

  useEffect(() => {
    if (removeState.success && removeState.date) {
      onClose();
      toast.success(removeState.message);
    }
  }, [removeState.success, removeState.date, onClose]);

  return {
    editAction,
    addState,
    removeState,
    isAddPending,
    isRemovePending,
    setEditAction,
    addFormAction,
    removeFormAction
  };
}
