import { useCallback, useRef, useState } from "react";

export default function useToast() {
  const [message, setMessage] = useState("");
  const timeoutRef = useRef(null);

  const showToast = useCallback((text, duration = 3500) => {
    clearTimeout(timeoutRef.current);
    setMessage(text);
    timeoutRef.current = setTimeout(() => setMessage(""), duration);
  }, []);

  const hideToast = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setMessage("");
  }, []);

  return { message, showToast, hideToast };
}