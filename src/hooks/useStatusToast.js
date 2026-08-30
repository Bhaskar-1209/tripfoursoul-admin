"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";

const isErrorMessage = (message) => /\b(error|failed|failure|cannot|can't|could not|unable|required|invalid|not found)\b/i.test(message);

// Drop-in replacement for useState("") used by existing admin status banners.
// Any non-empty status message is also surfaced through the app-wide toaster.
export default function useStatusToast(initialMessage = "") {
  const [message, setMessageState] = useState(initialMessage);

  const setMessage = useCallback((nextMessage) => {
    // Admin status setters pass strings. Supporting a function preserves the
    // familiar useState API without creating side effects inside a state updater.
    if (typeof nextMessage === "function") {
      setMessageState(nextMessage);
      return;
    }
    setMessageState(nextMessage);
    if (nextMessage) {
      if (isErrorMessage(nextMessage)) toast.error(nextMessage);
      else toast.success(nextMessage);
    }
  }, []);

  return [message, setMessage];
}
