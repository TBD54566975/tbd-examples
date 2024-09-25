import { DeleteIcon, Trash2Icon } from "lucide-react"
import { Input } from "../ui/input"
import { Typography } from "../ui/typography"

interface ConnectPinProps {
  value: string;
  onChange: (value: string) => void;
  close: () => void;
  submit: (pin: string) => void;
}

const ConnectPin: React.FC<ConnectPinProps> = ({ onChange, value, close, submit }) => {

  const submitPin = () => {
    if (value.length === 0) {
      return;
    }
    submit(value)
  }

  return (<div>
    <Typography variant="p">Please enter the PIN on your wallet</Typography>
    <div className="mt-2">
      <Input
        value={value}
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
          onClick={() => onChange(value + num.toString())}
        >
          {num}
        </button>
      ))}
      <button
        className="p-2 border-1 rounded text-primary flex justify-center items-center"
        onClick={() => onChange('')}
        >
          <Trash2Icon className="h-6 w-6" />
        </button>
      <button
        className="p-2 border-1 rounded text-primary flex justify-center items-center"
        onClick={() => onChange(value + '0')}
      >
        0
      </button>
      <button
        className="p-2 border-1 rounded text-primary flex justify-center items-center"
        onClick={() => onChange(value.slice(0, -1))}
      >
        <DeleteIcon className="h-6 w-6" />
      </button>
      {value.length > 0 && (
        <button
          className="p-2 border rounded col-span-3 mt-2 bg-primary text-secondary hover:bg-primary-dark"
          onClick={submitPin}
        >
          Submit
        </button>
      ) || (
        <button
        className="p-2 border rounded col-span-3 mt-2 bg-primary text-secondary hover:bg-primary-dark"
        onClick={() => close()}
        >
          Cancel
        </button>
      )}
    </div>
  </div>)
}

export default ConnectPin;