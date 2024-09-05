import React, { createContext, useEffect, useState } from "react";

import { ConnectOptions, Web5, Web5ConnectResult } from "@web5/api";
import { installProtocols } from "./protocols";

declare global {
  interface Window {
    web5: Web5ConnectResult;
  }
}

interface Web5ContextProps {
  previouslyConnected: boolean;
  protocolsInitialized: boolean;
  web5Connection?: Web5ConnectResult;
  connect: () => Promise<Web5ConnectResult>;
  walletConnect: (walletConnectOptions: ConnectOptions) => Promise<Web5ConnectResult>;
  isConnecting: boolean;
}

export const Web5Context = createContext<Web5ContextProps>({
  previouslyConnected: false,
  isConnecting: false,
  protocolsInitialized: false,
  walletConnect: async () => {
    throw new Error("context not initialized");
  },
  connect: async () => {
    throw new Error("context not initialized");
  },
});

export const Web5Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {

  const [ previouslyConnected, setPreviouslyConnected ] = useState(false);
  const [protocolsInitialized, setProtocolsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [web5Connection, setWeb5Connection] = useState<
    Web5ConnectResult | undefined
  >(undefined);

  useEffect(() => {
    const previouslyConnected = localStorage.getItem('previouslyConnected');
    if (previouslyConnected) {
      setPreviouslyConnected(previouslyConnected === 'true');
    }

    window.addEventListener('storage', (event) => {
      if (event.key === 'previouslyConnected') {
        setPreviouslyConnected(event.newValue === 'true')
      }
    });


  }, [ setPreviouslyConnected ]);

  useEffect(() => {
    if (web5Connection && !protocolsInitialized) {
      installProtocols(web5Connection.web5.dwn, web5Connection.did).then(
        (installationResult) => {
          setProtocolsInitialized(installationResult);
        }
      );
    }
  }, [web5Connection, protocolsInitialized]);

  const walletConnect = async (walletConnectOptions: ConnectOptions) => {
    const connection = await Web5.connect({ walletConnectOptions });
    window.web5 = connection;
    localStorage.setItem('previouslyConnected', 'true');
    setWeb5Connection(connection);
    setIsConnecting(false);
    return connection;
  }

  const connect = async () => {
    setIsConnecting(true);

    try {
      const connectOptions = {
        techPreview: {
          dwnEndpoints: ["https://dwn.tbddev.org/latest"],
        },
      };
      const connection = await Web5.connect(connectOptions);
      window.web5 = connection;
      localStorage.setItem('previouslyConnected', 'true');
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
        previouslyConnected,
        protocolsInitialized,
        walletConnect,
        connect,
        web5Connection,
        isConnecting,
      }}
    >
      {children}
    </Web5Context.Provider>
  );
};
