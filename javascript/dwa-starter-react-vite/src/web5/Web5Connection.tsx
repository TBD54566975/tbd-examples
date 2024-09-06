import { LogInIcon, Loader2Icon, XIcon, User2Icon, Wallet2Icon, DeleteIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

import { Button } from "@/components/ui/button";
import { useWeb5 } from "./use-web5";
import { profileDefinition, tasksProtocolDefinition } from "./protocols";
import { Typography } from "@/components/ui/typography";
import { toastError } from "@/lib/utils";
import { Input } from "@/components/ui/input";

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
  const [ isLoading, setIsLoading ] = useState(false);

  const createNewDid = async () => {
    if (!connect) {
      return;
    }

    setIsLoading(true);
    try {
      await connect();
    } catch(error) {
      toastError('Error creating new DID', error);
    } finally{
      setIsLoading(false);
      setIsOpen(false);
    }
  }


  const submitPin = () => {
    if (pin.length === 0) {
      return;
    }
    setIsLoading(true);
    postMessage({ type: 'pinSubmitted', pin }, window.parent.origin);
  }

  const displayWalletLinkQR = async () => {
    if (walletConnect) {
      setIsLoading(true);
      try {
        await walletConnect({
          walletUri: "web5://connect",
          connectServerUrl: "http://localhost:3000/connect",
          permissionRequests: [{ protocolDefinition: profileDefinition }, { protocolDefinition: tasksProtocolDefinition }],
          onWalletUriReady: (text: string) => {
            setQrCodeText(text);
            setIsLoading(false);
          },
          validatePin: async () => {
            setShowPinScreen(true);

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
        setIsLoading(false);
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    {isLoading && <Loader2Icon className="animate-spin h-12 w-12 text-primary" />}
    {!isLoading && (
      <div className="bg-secondary text-primary  p-6 rounded-lg">
        {showPinScreen && (
          <div>
            <Typography variant="p">Please enter the PIN on your wallet</Typography>
            <div className="mt-2">
              <Input
                value={pin}
                readOnly
                className="w-full p-2 border rounded text-center text-lg"
                placeholder="Enter PIN"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  className="p-2 border-1 rounded text-primary flex justify-center items-center"
                  onClick={() => setPin(prevPin => prevPin + num.toString())}
                >
                  {num}
                </button>
              ))}
              <button
                className="p-2 border-1 rounded text-primary flex justify-center items-center"
                onClick={() => setPin('')}
                >
                  <Trash2Icon className="h-6 w-6" />
                </button>
              <button
                className="p-2 border-1 rounded text-primary flex justify-center items-center"
                onClick={() => setPin(prevPin => prevPin + '0')}
              >
                0
              </button>
              <button
                className="p-2 border-1 rounded text-primary flex justify-center items-center"
                onClick={() => setPin(prevPin => prevPin.slice(0, -1))}
              >
                <DeleteIcon className="h-6 w-6" />
              </button>
              {pin.length > 0 && (
                <button
                  className="p-2 border rounded col-span-3 mt-2 bg-primary text-secondary hover:bg-primary-dark"
                  onClick={submitPin}
                >
                  Submit
                </button>
              ) || (
                <button
                className="p-2 border rounded col-span-3 mt-2 bg-primary text-secondary hover:bg-primary-dark"
                onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
        {!showPinScreen && qrCodeText && (
          <div>
            <a href={qrCodeText}>
              <Typography variant="h3">Scan QR Code</Typography>
              <QRCodeCanvas value={qrCodeText} size={256} className="mt-4 p-2 bg-primary" bgColor="rgb(250,204, 21)" fgColor="rgb(41,37,36)" />
            </a>
            <div className="mt-4">
              <Button onClick={() => setQrCodeText('')}>Cancel <XIcon className="ml-2 h-4 w-4" /></Button>
            </div>

          </div>
        )}
        {!showPinScreen && !qrCodeText && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h3">Connect to a Wallet</Typography>
          </div>
          <div className="flex flex-col space-y-4">
            <Button onClick={() => createNewDid()}>Create A New DID <User2Icon className="ml-2 h-4 w-4" /></Button>
            <Button onClick={() => displayWalletLinkQR()}>Connect To a Wallet <Wallet2Icon className="ml-2 h-4 w-4" /></Button>
            <Button onClick={() => setIsOpen(false)}>Cancel<XIcon className="ml-2 h-4 w-4" /></Button>
          </div>
        </div>)}
      </div>
    )}
  </div>)
}
