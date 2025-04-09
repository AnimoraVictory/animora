import React, { createContext, useContext, useState } from "react";

const ModalStackContext = createContext<{
  stack: string[];
  push: (id: string) => void;
  pop: () => void;
  isTop: (id: string) => boolean;
}>({
  stack: [],
  push: () => {},
  pop: () => {},
  isTop: () => false,
});

export const ModalStackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stack, setStack] = useState<string[]>([]);

  const push = (id: string) => setStack((prev) => [...prev, id]);
  const pop = () => setStack((prev) => prev.slice(0, -1));
  const isTop = (id: string) => stack[stack.length - 1] === id;

  return (
    <ModalStackContext.Provider value={{ stack, push, pop, isTop }}>
      {children}
    </ModalStackContext.Provider>
  );
};

export const useModalStack = () => useContext(ModalStackContext);
