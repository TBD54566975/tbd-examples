import { QRCodeCanvas } from "qrcode.react";
import { Typography } from "../ui/typography";
import { Button } from "../ui/button";
import { XIcon } from "lucide-react";

interface ConnectQRProps {
  value: string;
  close: () => void;
}

const ConnectQR: React.FC<ConnectQRProps> = ({ close, value }) => {
  return (<div>
    <a href={value}>
      <Typography variant="h3">Scan QR Code</Typography>
      <QRCodeCanvas value={value} size={256} className="mt-4 p-2 bg-primary" bgColor="rgb(250,204, 21)" fgColor="rgb(41,37,36)" />
    </a>
    <div className="mt-4">
      <Button onClick={() => close()}>Cancel <XIcon className="ml-2 h-4 w-4" /></Button>
    </div>
  </div>)
}

export default ConnectQR;