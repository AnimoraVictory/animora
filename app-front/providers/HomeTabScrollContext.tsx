import React, { createContext, useContext, useRef } from "react";

type HomeTabScrollContextType = {
  setHandler: (handler: () => void) => void;
  triggerHandler: () => void;
};

const HomeTabScrollContext = createContext<HomeTabScrollContextType | undefined>(undefined);

export const HomeTabScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const handlerRef = useRef<(() => void) | null>(null);

  const setHandler = (handler: () => void) => {
    handlerRef.current = handler;
  };

  const triggerHandler = () => {
    handlerRef.current?.();
  };

  return (
    <HomeTabScrollContext.Provider value={{ setHandler, triggerHandler }}>
      {children}
    </HomeTabScrollContext.Provider>
  );
};

export const useHomeTabHandler = () => {
  const context = useContext(HomeTabScrollContext);
  if (!context) {
    throw new Error("useHomeTabHandler must be used within HomeTabScrollProvider");
  }
  return context;
};
