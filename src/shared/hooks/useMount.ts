import { useEffect, useState } from "react";

export const useMount = (callback: () => void) => {
  const [data] = useState(void 0);

  useEffect(() => {
    callback();
  }, [true]);

  return data;
};
