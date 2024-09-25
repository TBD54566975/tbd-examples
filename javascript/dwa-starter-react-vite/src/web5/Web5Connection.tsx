import { LogInIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useWeb5 } from "./use-web5";
import ConnectSelector from "@/components/connect/connect-selector";

interface Web5ConnectionProps {
  connectButtonClassName?: string;
}

export const Web5Connection = ({
  connectButtonClassName,
}: Web5ConnectionProps) => {
  const { did, isConnecting } = useWeb5();
  const [isOpen, setIsOpen] = useState(false);

  const clearStorage = () => {
    // Clear localStorage
    localStorage.clear();

    // Clear IndexedDB
    indexedDB.databases().then(dbs => {
      dbs.forEach(db => {
        indexedDB.deleteDatabase(db.name!);
      });
    });

    window.location.reload();
  }

  if (did) {
    return <div>
      <div>Hi, {did.substring(0, 16)}...!</div>
      <Button variant="outline" onClick={clearStorage}>Disconnect</Button>
    </div>;
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
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <ConnectSelector
      close={() => setIsOpen(false)}
    />
  </div>)
}
