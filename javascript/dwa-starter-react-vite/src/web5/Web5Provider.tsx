import React, { createContext, useEffect, useState } from "react";

import { ConnectOptions, Web5, Web5ConnectResult } from "@web5/api";
import { Web5UserAgent } from "@web5/user-agent";
import { installProtocols } from "./protocols";
import { PortableDid } from "@web5/dids";
import { DwnDataEncodedRecordsWriteMessage } from "@web5/agent";

declare global {
  interface Window {
    web5: Web5ConnectResult;
  }
}

interface Web5ContextProps {
  previouslyConnected: boolean;
  protocolsInitialized: boolean;
  web5Connection?: Web5ConnectResult;
  connect?: () => Promise<Web5ConnectResult>;
  walletConnect?: (walletConnectOptions: ConnectOptions) => Promise<Web5ConnectResult>;
  processDelegateIdentity?: (did: string, portableDid: PortableDid, grants: DwnDataEncodedRecordsWriteMessage[]) => Promise<Web5ConnectResult>;
  isConnecting: boolean;
}

export const Web5Context = createContext<Web5ContextProps>({
  previouslyConnected: false,
  isConnecting: false,
  protocolsInitialized: false,
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

  const processDelegateIdentity = async (did: string, portableDid: PortableDid, grants: DwnDataEncodedRecordsWriteMessage[]) => {
    setIsConnecting(true);
    const userAgent = await Web5UserAgent.create();
    if (await userAgent.firstLaunch()) {
      await userAgent.initialize({ password: 'insecure-static-phrase', dwnEndpoints: ['https://dwn.tbddev.org/latest' ]});
    }
    await userAgent.start({ password: 'insecure-static-phrase' });
    // Import the delegated DID as an Identity in the User Agent.
    // Setting the connectedDID in the metadata applies a relationship between the signer identity and the one it is impersonating.
    const identity = await userAgent.identity.import({ portableIdentity: {
      portableDid,
      metadata    : {
        connectedDid: did,
        name   : 'Default',
        tenant : portableDid.uri,
        uri    : portableDid.uri,
      }
    }});
    await userAgent.identity.manage({ portableIdentity: await identity.export() });

    // Attempts to process the connected grants to be used by the delegateDID
    // If the process fails, we want to clean up the identity
    // the connected grants will return a de-duped array of protocol URIs that are used to register sync for those protocols
    const protocols = await Web5.processConnectedGrants({ agent: userAgent, delegateDid: portableDid.uri, grants });
    await userAgent.sync.registerIdentity({ did, options: { protocols, delegateDid: portableDid.uri } });
    await userAgent.sync.sync('pull');
    const web5 = new Web5({ agent: userAgent, connectedDid: did, delegateDid: portableDid.uri });
    const connection = { web5, did };
    localStorage.setItem('previouslyConnected', 'true');
    setWeb5Connection(connection);
    setIsConnecting(false);
    return connection;
  }

  const walletConnect = async (walletConnectOptions: ConnectOptions) => {
    const connection = await Web5.connect({ walletConnectOptions, sync: '15s' });
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
          dwnEndpoints: ["http://localhost:3000"],
        },
        sync: '15s',
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
        processDelegateIdentity,
        connect,
        web5Connection,
        isConnecting,
      }}
    >
      {children}
    </Web5Context.Provider>
  );
};
