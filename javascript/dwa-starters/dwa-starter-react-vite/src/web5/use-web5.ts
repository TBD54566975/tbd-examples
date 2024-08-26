import { useContext } from "react";
import { Web5Context } from "./Web5Provider";

export const useWeb5 = () => {
  const context = useContext(Web5Context);
  if (!context) {
    throw new Error("useWeb5 must be used within a Web5Provider");
  }

  const { web5Connection, isConnecting, connect } = context;

  const isConnected = web5Connection !== undefined;

  return {
    web5Connection,
    isConnecting,
    connect,
    dwn: web5Connection?.web5.dwn,
    did: web5Connection?.did,
    isConnected,
  };
};
