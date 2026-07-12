"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-client";

interface UseFormMutationOptions<TData> {
  mutationFn: () => Promise<TData>;
  onSuccess?: (data: TData) => void;
  successMessage?: string;
  errorMessage?: string;
}

interface UseFormMutationReturn {
  mutate: () => Promise<void>;
  isPending: boolean;
}

export function useFormMutation<TData = void>({
  mutationFn,
  onSuccess,
  successMessage,
  errorMessage,
}: UseFormMutationOptions<TData>): UseFormMutationReturn {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async () => {
    setIsPending(true);
    try {
      const data = await mutationFn();
      if (successMessage) {
        toast.success(successMessage);
      }
      onSuccess?.(data);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : (errorMessage ?? "Something went wrong");
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  }, [mutationFn, onSuccess, successMessage, errorMessage]);

  return { mutate, isPending };
}
