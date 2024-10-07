import { expect, test, vi, beforeEach } from "vitest";
import { DwnApi } from "@web5/api";

import { TodoDwnRepository, Task } from "./todo-dwn-repository";
import { tasksProtocolDefinition } from "@/web5/protocols";

// Mock DwnApi
const mockDwnApi = {
  records: {
    create: vi.fn(),
    read: vi.fn(),
    query: vi.fn(),
  },
};

const mockRecord = {
  id: "mockId",
  data: {
    json: vi.fn(),
  },
  update: vi.fn(),
  delete: vi.fn(),
  send: vi.fn(),
};

let repository: TodoDwnRepository;

beforeEach(() => {
  repository = new TodoDwnRepository(mockDwnApi as unknown as DwnApi);
  vi.clearAllMocks();
});

test("listTasks returns formatted tasks", async () => {
  const mockTasks = [
    { id: "1", title: "Task 1", completed: false },
    { id: "2", title: "Task 2", completed: true },
  ];
  mockDwnApi.records.query.mockResolvedValue({
    records: mockTasks.map((task) => ({
      ...mockRecord,
      id: task.id,
      data: { json: () => task },
    })),
  });

  const result = await repository.listTasks();

  expect(result).toEqual(mockTasks);
  expect(mockDwnApi.records.query).toHaveBeenCalledWith({
    protocol: tasksProtocolDefinition.protocol,
    message: {
      filter: {
        protocol: tasksProtocolDefinition.protocol,
        protocolPath: "task",
        dataFormat: "application/json",
      },
    },
  });
});

test("createTask creates a new task", async () => {
  const newTask: Task = { title: "New Task", completed: false };
  mockDwnApi.records.create.mockResolvedValue({
    status: { code: 202 },
    record: mockRecord,
  });

  await repository.createTask(newTask);

  expect(mockDwnApi.records.create).toHaveBeenCalledWith({
    data: newTask,
    message: {
      protocol: tasksProtocolDefinition.protocol,
      protocolPath: "task",
      schema: tasksProtocolDefinition.types.task.schema,
      dataFormat: tasksProtocolDefinition.types.task.dataFormats[0],
      published: true,
      tags: {
        completed: false,
      },
    },
  });
  expect(mockRecord.send).toHaveBeenCalled();
});

test("updateTask updates an existing task", async () => {
  const updatedTask: Task = {
    id: "existingId",
    title: "Updated Task",
    completed: true,
  };
  mockDwnApi.records.read.mockResolvedValue({ record: mockRecord });
  mockRecord.update.mockResolvedValue({ status: { code: 202 } });

  await repository.updateTask(updatedTask);

  expect(mockDwnApi.records.read).toHaveBeenCalledWith({
    protocol: tasksProtocolDefinition.protocol,
    message: {
      filter: {
        recordId: "existingId",
      },
    },
  });
  expect(mockRecord.update).toHaveBeenCalledWith({
    data: { title: "Updated Task", completed: true },
    tags: {
      completed: true,
    },
  });
  expect(mockRecord.send).toHaveBeenCalled();
});

test("deleteTask deletes an existing task", async () => {
  const taskId = "existingId";
  mockDwnApi.records.read.mockResolvedValue({ record: mockRecord });

  await repository.deleteTask(taskId);

  expect(mockDwnApi.records.read).toHaveBeenCalledWith({
    protocol: tasksProtocolDefinition.protocol,
    message: {
      filter: {
        recordId: taskId,
      },
    },
  });
  expect(mockRecord.delete).toHaveBeenCalled();
  expect(mockRecord.send).toHaveBeenCalled();
});

test("findTaskRecord returns a task record if found", async () => {
  const taskId = "existingId";
  mockDwnApi.records.read.mockResolvedValue({ record: mockRecord });

  const result = await repository.findTaskRecord(taskId);

  expect(result).toBe(mockRecord);
  expect(mockDwnApi.records.read).toHaveBeenCalledWith({
    protocol: tasksProtocolDefinition.protocol,
    message: {
      filter: {
        recordId: taskId,
      },
    },
  });
});

test("findTaskRecord returns undefined if task not found", async () => {
  const taskId = "nonExistentId";
  mockDwnApi.records.read.mockResolvedValue({ record: { id: undefined } });

  const result = await repository.findTaskRecord(taskId);

  expect(result).toBeUndefined();
});

test("createTask throws an error if status code is not 202", async () => {
  const newTask: Task = { title: "New Task", completed: false };
  mockDwnApi.records.create.mockResolvedValue({
    status: { code: 400, detail: "Bad Request" },
  });

  await expect(repository.createTask(newTask)).rejects.toThrow("Bad Request");
});

test("updateTask throws an error if task ID is missing", async () => {
  const invalidTask: Task = { title: "Invalid Task", completed: false };

  await expect(repository.updateTask(invalidTask)).rejects.toThrow(
    "Task ID is required"
  );
});

test("updateTask throws an error if task is not found", async () => {
  const nonExistentTask: Task = {
    id: "nonExistentId",
    title: "Non-existent Task",
    completed: false,
  };
  mockDwnApi.records.read.mockResolvedValue({ record: { id: undefined } });

  await expect(repository.updateTask(nonExistentTask)).rejects.toThrow(
    "Task not found"
  );
});

test("deleteTask throws an error if task is not found", async () => {
  const nonExistentTaskId = "nonExistentId";
  mockDwnApi.records.read.mockResolvedValue({ record: { id: undefined } });

  await expect(repository.deleteTask(nonExistentTaskId)).rejects.toThrow(
    "Task not found"
  );
});
