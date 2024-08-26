import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "@/lib/todo-dwn-repository";
import { PencilIcon, TrashIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  handleToggleTaskCompletion: (task: Task) => void;
  setTaskInput: (task: Task) => void;
  handleDeleteTask: (taskId: string) => void;
  disabled: boolean;
}

export const TaskItem = ({
  task,
  handleToggleTaskCompletion,
  setTaskInput,
  handleDeleteTask,
  disabled,
}: TaskItemProps) => {
  return (
    <div
      key={task.id}
      className="mb-2 w-full flex justify-between items-center pb-2 last:mb-0 last:pb-0"
    >
      <div
        className="flex cursor-pointer"
        onClick={() => handleToggleTaskCompletion(task)}
      >
        <Checkbox
          checked={task.completed}
          className="w-8 h-8"
          disabled={disabled}
        />
        <p
          className={cn(
            "text-lg font-medium ml-2",
            task.completed && "line-through text-muted-foreground",
            disabled && "text-muted-foreground"
          )}
        >
          {task.title}
        </p>
      </div>
      <div>
        <Button
          variant="ghost"
          className="ml-4"
          size="icon"
          disabled={disabled}
          onClick={() => setTaskInput({ ...task })}
        >
          <PencilIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="destructive"
          className="ml-2"
          size="icon"
          disabled={disabled}
          onClick={() => handleDeleteTask(task.id!)}
        >
          <TrashIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
