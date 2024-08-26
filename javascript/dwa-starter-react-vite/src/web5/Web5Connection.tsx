import { LogInIcon, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWeb5 } from "./use-web5";

interface Web5ConnectionProps {
  connectButtonClassName?: string;
}

export const Web5Connection = ({
  connectButtonClassName,
}: Web5ConnectionProps) => {
  const { did, connect, isConnecting } = useWeb5();

  if (did) {
    return <div>Hi, {did.substring(0, 16)}...!</div>;
  } else {
    return (
      <Button
        variant="outline"
        className={connectButtonClassName}
        onClick={connect}
        disabled={isConnecting}
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
    );
  }
};
