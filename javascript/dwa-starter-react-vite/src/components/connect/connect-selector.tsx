import { Loader2Icon, User2Icon, Wallet2Icon, XIcon } from "lucide-react";
import { Button } from "../ui/button"
import { Typography } from "../ui/typography"
import { useWeb5 } from "@/web5";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { ConnectOptions, Web5, Web5ConnectResult } from "@web5/api";
import { DwnDataEncodedRecordsWriteMessage, WalletConnect } from "@web5/agent";
import ConnectQR from "./connect-qr";
import ConnectPin from "./connect-pin";
import { profileDefinition, tasksProtocolDefinition } from "@/web5/protocols";
import { toastError } from "@/lib/utils";
import { Convert } from '@web5/common';
import { PortableDid } from "@web5/dids";

const popupContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connecting...</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: Arial, sans-serif;
      text-align: center;
      background: #000;
      color: #fff;
    }
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .text {
      font-size: 16px;
      color: #333;
    }
    .spinner {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 15px;
      font-size: 2em;
    }
      .spinner div {
        position: relative;
        width: 2em;
        height: 2em;
        margin: 0.1em 0.25em 0 0;
      }
      .spinner div::after,
      .spinner div::before {
        content: '';  
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 0.1em solid #FFF;
        position: absolute;
        left: 0;
        top: 0;
        opacity: 0;
        animation: spinner 2s linear infinite;
      }
      .spinner div::after {
        animation-delay: 1s;
      }
    @keyframes spinner {
      0% {
        transform: scale(0);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner">
      <div></div>
    </div>
    <div id="message">Locating wallets...</div>
  </div>
</body>
</html>
`;

interface ConnectSelectorProps {
  close         : () => void;
}

type ConnectState = 'init' | 'wallet' | 'showQR' | 'showPin' | 'loading' | 'done';

const ConnectSelector: React.FC<ConnectSelectorProps> = ({
  close,
}) => {
  const { connect, walletConnect } = useWeb5();

  const [ state, setState ] = useState<ConnectState>('loading');
  const [ qrCode, setQrCode ] = useState('');
  const [ pin, setPin ] = useState('');

  useEffect(() => {
    if (qrCode.length > 0) {
      setState('showQR');
    }
  }, [ qrCode ]);

  useEffect(() => {
    if (state === 'done') {
      setTimeout(close, 500);
    }
  },[ state, close ]);


  useEffect(() => {
    if (connect !== undefined && walletConnect !== undefined) {
      setState('init');
    }
  }, [ connect, walletConnect ]);

  const createDid = async () => {
    if (!connect) {
      return;
    }

    setState('loading');
    try {
      await connect();
    } catch(error) {
      toastError('Error creating new DID', error);
    } finally{
      close();
    }
  }

  const submitPin = () => {
    if (pin.length === 0) {
      return;
    }
    setState('loading');
    postMessage({ type: 'pinSubmitted', pin }, window.parent.origin);
  }


  return (<div className="bg-secondary text-primary  p-6 rounded-lg">
    {state === 'loading' && <Loader2Icon className="animate-spin h-12 w-12 text-primary" />}
    {state === 'init' && <div>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h3">Connect to a Wallet</Typography>
      </div>
      <div className="flex flex-col space-y-4">
        <Button onClick={() => createDid()}>Create A New DID <User2Icon className="ml-2 h-4 w-4" /></Button>
        <Button onClick={() => setState('wallet')}>Connect To a Wallet <Wallet2Icon className="ml-2 h-4 w-4" /></Button>
        <Button onClick={() => close()}>Cancel<XIcon className="ml-2 h-4 w-4" /></Button>
      </div>
    </div>}
    {state === 'wallet' && <WalletSelector
      walletConnect={walletConnect!}
      setQrCodeText={setQrCode}
      setState={setState}
    />}
    {state === 'showQR' && <ConnectQR
      value={qrCode}
      close={close}
    />}
    {state === 'showPin' && <ConnectPin
      value={pin}
      onChange={setPin}
      close={close}
      submit={submitPin}
    />}
    {state === 'done' && <div>Done</div>}
  </div>)
}

interface WalletSelectorProps {
  setQrCodeText : (text: string) => void;
  walletConnect : (options: ConnectOptions) => Promise<Web5ConnectResult>;
  setState      : (state: ConnectState) => void;
}

const WalletSelector: React.FC<WalletSelectorProps> = ({
  setQrCodeText,
  walletConnect,
  setState,
}) => {
  const { processDelegateIdentity } = useWeb5();
  const [ didInputValue, setDidInputValue ] = useState<string>('');

  const displayWalletLinkQR = async () => {
    setState('loading');

    try {
      await walletConnect({
        connectServerUrl: "https://dwn.tbddev.org/latest/connect",
        walletUri: "web5://connect",
        permissionRequests: [{ protocolDefinition: profileDefinition }, { protocolDefinition: tasksProtocolDefinition }],
        onWalletUriReady: (text: string) => {
          setQrCodeText(text);
        },
        validatePin: async () => {
          setState('showPin');

          return new Promise((resolve) => {
            const eventListener = (event: MessageEvent) => {
              if (event.data.type === 'pinSubmitted') {
                removeEventListener('message', eventListener);
                resolve(event.data.pin);
              }
            }

            addEventListener('message', eventListener);
          });
        },
      })
    } catch(error) {
      toastError('Error connecting to wallet', error);
    } finally {
      setState('done');
    }
  }

  const createHiddenFrame = (options: {
    src?: string,
    srcdoc?: string,
    appendTo?: HTMLElement,
    onLoad?: (e: HTMLIFrameElement) => void
  } = {}) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.bottom = '0';
    iframe.style.left = '0';
    iframe.style.width = '1px'; 
    iframe.style.height = '1px';
    iframe.style.zIndex = '-1000';
    if (options.onLoad !== undefined) {
      iframe.addEventListener('load', () => options.onLoad!(iframe), { once: true });
    }
    if (options.src) iframe.src = options.src;
    else if (options.srcdoc) iframe.srcdoc = options.srcdoc;
    if (options.appendTo) options.appendTo.append(iframe);
    return iframe;
  }

  const requiredPermissions = () => {
    const request = [tasksProtocolDefinition, profileDefinition];
    return request.map(definition => WalletConnect.createPermissionRequestForProtocol({ definition, permissions: [
      'read', 'write', 'delete', 'query', 'subscribe'
    ] }));
  }

  const didInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const didInputRegex = /(?:[^@]*@)?(did:[a-z0-9]+:[a-zA-Z0-9-]+)/;
    setDidInputValue(e.target.value);
    const didMatch = e.target.value.match(didInputRegex);
    if (e.isTrusted && didMatch) {
      const width = 500;
      const height = 600;
      const left = (screen.width - width) / 2;
      const top = (screen.height - height) / 2;

      const popup = window.open('', '_blank', `popup=true,width=${width},height=${height},left=${left},top=${top}`);
      popup?.document.write(popupContent);

      const did = didMatch[1];
      try {
        const connectData = await fetch(
          `https://dweb/${did}/read/protocols/${Convert.string('https://areweweb5yet.com/protocols/profile').toBase64Url()}/connect`
        );
        const connectDataJson = await connectData.json();
        const wallets = connectDataJson?.webWallets as string[];
        if (!wallets?.length) return;
        const walletDomain = await Promise.race(wallets.map((domain) => {
          return new Promise((resolve, reject) => {
            const url = new URL(domain);
            createHiddenFrame({
              appendTo: document.body,
              src: url.origin + '/dweb-connect',
              onLoad: iframe => {
                window.addEventListener('message', e => {
                  if (e.origin === url.origin && e.data.type === 'dweb-connect-support-response') {
                    iframe.remove();
                    e.data.supported ? resolve(url.origin) : reject();
                  }
                });

                iframe.contentWindow?.postMessage({ type: 'dweb-connect-support-request', did }, url.origin);
                setTimeout(() => {
                  iframe.remove();
                  reject();
                }, 6000);
              }
            });
          });
        }));
        if (!walletDomain) {
          // set error message somewhere
          popup?.close();
        }
        if (!walletDomain) return;
        const messageListener = (event: MessageEvent<{ type: string, grants?: DwnDataEncodedRecordsWriteMessage[], delegateDid?: PortableDid}>) => {
          const { type, grants, delegateDid } = event.data;
          if (event.origin === walletDomain){
            if (type === 'dweb-connect-loaded') {
              popup?.postMessage({
                type: 'dweb-connect-authorization-request',
                did,
                permissions: requiredPermissions()
              }, walletDomain);
            } else if (type === 'dweb-connect-authorization-response') {
              window.removeEventListener('message', messageListener);
              if (processDelegateIdentity) {
                processDelegateIdentity(did, delegateDid!, grants!);
                setState('done');
              }
            }
          }
        }
        window.addEventListener('message', messageListener);
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
          }
        }, 500);
        popup!.location.href = walletDomain + '/dweb-connect#origin=' + location.origin;
      } catch(error) {
        // Set error message somewhere
        setTimeout(() => popup?.close(), 500);
      }
    }
  }

  return (<div className="flex flex-col justify-between">
    <Input value={didInputValue} onChange={didInput} name="email" placeholder="Enter DID Address" />
    <Button onClick={displayWalletLinkQR} className="mt-4">QR Code</Button>
  </div>)
}

export default ConnectSelector;