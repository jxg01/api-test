import { defineStore } from 'pinia';
import { scheduleTasksApi } from '@/api'

export interface Task {
  id: number;
  name: string;
  task_type: string;
  enabled: number; // 0: 关闭, 1: 开启
  cron: string;
  created_by: string;
  updated_by: string;
}

export interface ExecutionLog {
  id: number;
  taskId: number;
  taskName: string;
  time: string;
  result: '成功' | '失败' | '退出';
  duration: number;
  trigger: string;
  logContent: string;
}

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [] as Task[],
    selectedTaskId: null as number | null,
    executionHistory: [
      { id: 1, taskId: 1, taskName: '用户数据同步', time: '2025-07-21 03:00:02', result: '成功', duration: 125, trigger: '定时触发', logContent: '任务开始执行...\n连接数据库成功\n数据同步完成\n共处理记录: 12,458条\n任务执行成功' },
      { id: 2, taskId: 1, taskName: '用户数据同步', time: '2025-07-20 03:00:01', result: '成功', duration: 118, trigger: '定时触发', logContent: '任务开始执行...\n连接数据库成功\n数据同步完成\n共处理记录: 11,982条\n任务执行成功' },
      { id: 3, taskId: 1, taskName: '用户数据同步', time: '2025-07-19 03:00:03', result: '失败', duration: 23, trigger: '定时触发', logContent: '任务开始执行...\n连接数据库失败\n错误代码: 1045\n错误信息: Access denied for user\n任务执行失败' },
      { id: 4, taskId: 1, taskName: '用户数据同步', time: '2025-07-18 03:00:01', result: '成功', duration: 132, trigger: '定时触发', logContent: '任务开始执行...\n连接数据库成功\n数据同步完成\n共处理记录: 13,205条\n任务执行成功' },
      { id: 5, taskId: 1, taskName: '用户数据同步', time: '2025-07-17 03:00:02', result: '成功', duration: 121, trigger: '定时触发', logContent: '任务开始执行...\n连接数据库成功\n数据同步完成\n共处理记录: 12,076条\n任务执行成功' },
      { id: 6, taskId: 1, taskName: '用户数据同步', time: '2025-07-16 03:00:04', result: '退出', duration: 45, trigger: '手动触发', logContent: '任务开始执行...\n用户手动终止任务\n任务已退出' }
    ] as ExecutionLog[],
    logDrawerVisible: false,
    selectedLog: null as ExecutionLog | null
  }),
  getters: {
    selectedTask(): Task | null {
      return this.tasks.find(task => task.id === this.selectedTaskId) || null;
    },
    filteredHistory(): ExecutionLog[] {
      if (!this.selectedTaskId) return [];
      return this.executionHistory.filter(h => h.taskId === this.selectedTaskId);
    }
  },
  actions: {
    selectTask(taskId: number) {
      this.selectedTaskId = taskId;
    },
    updateTaskStatus(task: Task) {
      console.log(`更新任务状态: ${task.name} -> ${task.enabled ? '开启' : '关闭'}`);
      // 在实际项目中这里调用API
    },
    async updateTask(updatedTask: Task) {
      // 在实际项目中这里调用API
      const { id, ...updateData } = updatedTask;
      const res = await scheduleTasksApi.editScheduleTask(id, updateData);
      if (!res) {
        console.error('更新任务失败');
        return;
      }
      const index = this.tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        this.tasks[index] = { ...this.tasks[index], ...updateData };
      }
      await this.fetchTasksList(); // 刷新任务列表

      // const index = this.tasks.findIndex(t => t.id === updatedTask.id);
      // if (index !== -1) {
      //   this.tasks[index] = updatedTask;
      // }
    },
    showLogDetail(log: ExecutionLog) {
      this.selectedLog = log;
      this.logDrawerVisible = true;
    },
    async fetchTasksList() {
      try {
        const res = await scheduleTasksApi.getScheduleTasksList()
        this.tasks = res.data
      } catch (error) {
        // 你可以在这里处理错误
        console.error('获取任务列表失败', error);
      }
    },
    async deleteTask(taskId: number) {
      try {
        await scheduleTasksApi.deleteScheduleTask(taskId);
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        console.log(`任务 ${taskId} 删除成功`);
      } catch (error) {
        console.error(`删除任务 ${taskId} 失败`, error);
      }
    },

    async addTask(newTask: Task) {
      try {
        const res = await scheduleTasksApi.createScheduleTask(newTask);
        if (!res) {
          console.error('添加任务失败');
          return;
        }
        this.tasks.push(res);
        console.log(`任务 ${newTask.name} 添加成功`);
        console.log('新任务详情1:', res);
        this.selectedTaskId = res.id; // 设置新任务为选中状态
        this.fetchTasksList(); // 刷新任务列表
      } catch (error) {
        console.error(`添加任务 ${newTask.name} 失败`, error);
      }
    }

  }
});
