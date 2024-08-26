import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Task, BLANK_TASK } from "@/lib/todo-dwn-repository";
import { BanIcon } from "lucide-react";

interface TaskFormProps {
  taskInput: Task;
  setTaskInput: (task: Task) => void;
  handleTaskSubmit: (formEvent: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export const TaskForm = ({
  taskInput,
  setTaskInput,
  handleTaskSubmit,
  isLoading,
}: TaskFormProps) => {
  return (
    <form onSubmit={handleTaskSubmit}>
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          placeholder="Add a new task"
          value={taskInput.title}
          required
          onChange={(e) =>
            setTaskInput({ ...taskInput, title: e.target.value })
          }
        />
        <Button type="submit" disabled={isLoading}>
          {taskInput.id ? "Update" : "Add"} Task
        </Button>
        <Button
          type="reset"
          variant="ghost"
          onClick={() => setTaskInput({ ...BLANK_TASK })}
          disabled={isLoading}
        >
          <BanIcon className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
};
