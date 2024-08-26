import React, { createContext, useEffect, useState } from "react";

import { Web5, Web5ConnectResult } from "@web5/api";
import { installProtocols } from "./protocols";

declare global {
  interface Window {
    web5: Web5ConnectResult;
  }
}

interface Web5ContextProps {
  protocolsInitialized: boolean;
  web5Connection?: Web5ConnectResult;
  connect?: () => Promise<Web5ConnectResult>;
  isConnecting: boolean;
}

export const Web5Context = createContext<Web5ContextProps>({
  isConnecting: false,
  protocolsInitialized: false,
});

export const Web5Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [protocolsInitialized, setProtocolsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [web5Connection, setWeb5Connection] = useState<
    Web5ConnectResult | undefined
  >(undefined);

  useEffect(() => {
    if (web5Connection && !protocolsInitialized) {
      installProtocols(web5Connection.web5.dwn, web5Connection.did).then(
        (installationResult) => {
          setProtocolsInitialized(installationResult);
        }
      );
    }
  }, [web5Connection, protocolsInitialized]);

  const connect = async () => {
    setIsConnecting(true);

    try {
      const connectOptions = {
        techPreview: {
          dwnEndpoints: ["http://localhost:3000"],
        },
      };
      const connection = await Web5.connect(connectOptions);
      window.web5 = connection;
      setWeb5Connection(connection);
      setIsConnecting(false);
      return connection;
    } catch (error) {
      setIsConnecting(false);
      throw error;
    }
  };

  return (
    <Web5Context.Provider
      value={{
        protocolsInitialized,
        connect,
        web5Connection,
        isConnecting,
      }}
    >
      {children}
    </Web5Context.Provider>
  );
};
