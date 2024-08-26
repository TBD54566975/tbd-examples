import { DwnApi } from "@web5/api";

const TASK_SCHEMA = "https://schema.org/TaskSample";

export interface Task {
  id?: string;
  title: string;
  completed: boolean;
}

export const BLANK_TASK: Task = {
  title: "",
  completed: false,
};

export class TodoDwnRepository {
  constructor(private readonly dwn: DwnApi) {}

  async listTasks() {
    const records = await this.listTasksRecords();
    const tasksJson: Task[] = await Promise.all(
      records.map(async (r) => {
        const { title, completed } = await r.data.json();
        return {
          id: r.id,
          title,
          completed,
        };
      })
    );
    return tasksJson.map((r) => ({
      id: r.id,
      title: r.title,
      completed: r.completed,
    }));
  }

  async createTask(task: Task) {
    const { status, record } = await this.dwn.records.create({
      data: task,
      message: {
        schema: TASK_SCHEMA,
        dataFormat: "application/json",
        published: true,
      },
    });
    if (status.code !== 202) {
      throw Error(status.detail);
    }
    if (record) {
      await record.send();
    }
  }

  async updateTask(task: Task) {
    if (!task.id) {
      throw new Error("Task ID is required");
    }

    const record = await this.findTaskRecord(task.id);
    if (!record) {
      throw new Error("Task not found");
    }

    const data = { ...task };
    delete data.id; // omits record id from data

    const { status } = await record.update({
      data,
    });
    if (status.code !== 202) {
      throw Error(status.detail);
    }
    await record.send();
  }

  async deleteTask(recordId: string) {
    const record = await this.findTaskRecord(recordId);
    if (!record) {
      throw new Error("Task not found");
    }
    await record.delete();
    return record.send();
  }

  async findTaskRecord(recordId: string) {
    const { record } = await this.dwn.records.read({
      message: {
        filter: {
          recordId,
        },
      },
    });
    return record.id ? record : undefined;
  }

  async listTasksRecords() {
    const { records } = await this.dwn.records.query({
      message: {
        filter: {
          schema: TASK_SCHEMA,
          dataFormat: "application/json",
        },
      },
    });

    return records || [];
  }
}
