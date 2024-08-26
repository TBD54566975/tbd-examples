import { useCallback, useEffect, useMemo, useState } from "react";

import { useWeb5 } from "@/web5";
import { Typography } from "@/components/ui/typography";

import { toastError, toastSuccess } from "@/lib/utils";
import { TodoDwnRepository, Task, BLANK_TASK } from "@/lib/todo-dwn-repository";
import { TaskListLoader } from "./task-list-loader";
import { TaskItem } from "./task-item";
import { TaskForm } from "./task-form";

export const TodoList = () => {
  const { dwn } = useWeb5();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInput, setTaskInput] = useState<Task>({ ...BLANK_TASK });
  const [isLoading, setIsLoading] = useState(false);

  const todoDwnRepository = useMemo(() => {
    console.info("todoDwnRepository useMemo set dwn", { dwn });
    if (!dwn) {
      return undefined;
    }
    return new TodoDwnRepository(dwn);
  }, [dwn]);

  const loadTasks = useCallback(async () => {
    if (!todoDwnRepository) {
      return;
    }
    setIsLoading(true);
    try {
      const tasks = await todoDwnRepository.listTasks();
      setTasks(tasks);
    } catch (error) {
      toastError("Error loading tasks", error);
    }
    setIsLoading(false);
  }, [todoDwnRepository]);

  useEffect(() => {
    console.info("todoDwnRepository loadTasks effect");
    if (todoDwnRepository) {
      loadTasks();
    }
  }, [todoDwnRepository, loadTasks]);

  if (!todoDwnRepository) {
    return <div>Invalid Web5 connection</div>;
  }

  const handleTaskSubmit = async (
    formEvent: React.FormEvent<HTMLFormElement>
  ) => {
    formEvent.preventDefault();

    if (taskInput.id) {
      await updateTask(taskInput);
    } else {
      await createTask(taskInput);
    }
  };

  const createTask = async (task: Task) => {
    setIsLoading(true);
    try {
      await todoDwnRepository.createTask(task);
      setTaskInput({ ...BLANK_TASK });
      toastSuccess("Task created successfully");
    } catch (error) {
      toastError("Error creating task", error);
    }
    setIsLoading(false);
    loadTasks();
  };

  const updateTask = async (task: Task) => {
    setIsLoading(true);
    try {
      await todoDwnRepository.updateTask(task);
      setTaskInput({ ...BLANK_TASK });
      toastSuccess("Task updated successfully");
    } catch (error) {
      toastError("Error updating task", error);
    }
    setIsLoading(false);
    loadTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    setIsLoading(true);
    try {
      await todoDwnRepository.deleteTask(taskId);
      toastSuccess("Task removed successfully");
    } catch (error) {
      toastError("Error removing task", error);
    }
    setIsLoading(false);
    loadTasks();
  };

  const handleToggleTaskCompletion = async (task: Task) => {
    await updateTask({ ...task, completed: !task.completed });
    await loadTasks();
  };

  return (
    <div className="space-y-8">
      <Typography variant="h1">My Tasks</Typography>
      <div className="w-full max-w-lg">
        {isLoading && tasks.length === 0 && <TaskListLoader />}
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            handleToggleTaskCompletion={handleToggleTaskCompletion}
            setTaskInput={setTaskInput}
            handleDeleteTask={handleDeleteTask}
            disabled={isLoading}
          />
        ))}
      </div>
      <TaskForm
        taskInput={taskInput}
        setTaskInput={setTaskInput}
        handleTaskSubmit={handleTaskSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};
