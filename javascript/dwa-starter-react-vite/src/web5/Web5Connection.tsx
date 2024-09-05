import { LogInIcon, Loader2Icon, XIcon, User2Icon, Wallet2Icon } from "lucide-react";
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

import { Button } from "@/components/ui/button";
import { useWeb5 } from "./use-web5";
import { profileDefinition, tasksProtocolDefinition } from "./protocols";

interface Web5ConnectionProps {
  connectButtonClassName?: string;
}

export const Web5Connection = ({
  connectButtonClassName,
}: Web5ConnectionProps) => {
  const { did, isConnecting } = useWeb5();
  const [isOpen, setIsOpen] = useState(false);

  if (did) {
    return <div>Hi, {did.substring(0, 16)}...!</div>;
  } else {
    return (
      <>
        <Button
          variant="outline"
          className={connectButtonClassName}
          disabled={isConnecting}
          onClick={() => setIsOpen(true)}
        >
          {isConnecting ? (
            <>
              Connecting <Loader2Icon className="ml-2 h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              Connect <LogInIcon className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        {isOpen && <ConnectionOption setIsOpen={setIsOpen} />}
      </>
    );
  }
};

const ConnectionOption = ({ setIsOpen }: { setIsOpen: (isOpen:boolean) => void}) => {
  const { walletConnect, connect } = useWeb5();

  const [ qrCodeText, setQrCodeText ] = useState("");
  const [ showPinScreen, setShowPinScreen ] = useState(false);
  const [ pin, setPin ] = useState("");

  const submitPin = () => {
    postMessage({ type: 'pinSubmitted', pin }, window.parent.origin);
  }

  const displayWalletLinkQR = async () => {
    await walletConnect({
      walletUri: "web5://connect",
      connectServerUrl: "http://localhost:3000/connect",
      permissionRequests: [{ protocolDefinition: profileDefinition }, { protocolDefinition: tasksProtocolDefinition }],
      onWalletUriReady: (text: string) => {
        setQrCodeText(text);
      },
      validatePin: async () => {
        setShowPinScreen(true);

        return new Promise((resolve) => {
          const checkPinSubmitted = () => {

            const eventListener = (event: MessageEvent) => {
              if (event.data.type === 'pinSubmitted') {
                removeEventListener('message', eventListener);
                resolve(event.data.pin);
              }
            }

            addEventListener('message', eventListener);
          }

          checkPinSubmitted();
        });
      },
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg">
      {showPinScreen && (
        <div>
          <h3>Enter your PIN</h3>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
              <button
                key={num}
                className="p-2 border rounded text-black"
                onClick={() => setPin(prevPin => prevPin + num.toString())}
              >
                {num}
              </button>
            ))}
            <button
              className="p-2 border rounded col-span-2"
              onClick={() => setPin(prevPin => prevPin.slice(0, -1))}
            >
              Delete
            </button>
          <button
            className="p-2 border rounded col-span-3 mt-2 bg-blue-500 text-white hover:bg-blue-600"
            onClick={submitPin}
          >
            Submit
          </button>
          </div>
          <div className="mt-2">
            <input
              type="password"
              value={pin}
              readOnly
              className="w-full p-2 border rounded"
              placeholder="PIN"
            />
          </div>
        </div>
      )}
      {!showPinScreen && qrCodeText && (
        <div>
          <h3>Scan the QR code to connect your wallet</h3>
          <QRCodeCanvas value={qrCodeText} size={256} />
          <a href={qrCodeText}>Open in Wallet</a>
        </div>
      )}
      {!showPinScreen && !qrCodeText && (
        <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-black">Choose a connection option</h2>
      </div>
      <div className="flex flex-col space-y-4">
        <Button onClick={() => connect()}>Create A New DID <User2Icon className="ml-2 h-4 w-4" /></Button>
        <Button onClick={() => displayWalletLinkQR()}>Connect To a Wallet <Wallet2Icon className="ml-2 h-4 w-4" /></Button>
        <Button onClick={() => setIsOpen(false)}>Cancel<XIcon className="ml-2 h-4 w-4" /></Button>
      </div>
      </div>)}
    </div>
  </div>)
}
