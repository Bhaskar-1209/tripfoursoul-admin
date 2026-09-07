"use client";

import { useCallback, useState } from "react";

const serialize = (value) => JSON.stringify(value ?? null);

export default function useDirtyForm(value) {
  const [initialValue, setInitialValue] = useState(() => serialize(value));

  const isDirty = serialize(value) !== initialValue;
  const markSaved = useCallback((nextValue) => {
    setInitialValue(serialize(nextValue));
  }, []);

  return { isDirty, markSaved };
}
