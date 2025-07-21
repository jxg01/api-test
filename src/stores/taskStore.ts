import { defineStore } from 'pinia';

export interface Task {
  id: number;
  name: string;
  type: string;
  status: number; // 0: 关闭, 1: 开启
  cron: string;
  creator: string;
  editor: string;
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
    tasks: [
      { id: 1, name: '用户数据同步', type: '数据同步', status: 1, cron: '0 0 3 * * ?', creator: 'admin', editor: 'admin' },
      { id: 2, name: '日报表生成', type: '报表生成', status: 0, cron: '0 30 4 * * ?', creator: 'admin', editor: 'user1' },
      { id: 3, name: '日志清理任务', type: '数据清理', status: 1, cron: '0 0 2 * * ?', creator: 'user2', editor: 'admin' },
      { id: 4, name: '外部API同步', type: 'API调用', status: 1, cron: '0 */30 * * * ?', creator: 'user1', editor: 'user1' },
      { id: 5, name: '备份任务', type: '数据备份', status: 0, cron: '0 0 1 * * ?', creator: 'admin', editor: 'admin' }
    ] as Task[],
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
      console.log(`更新任务状态: ${task.name} -> ${task.status ? '开启' : '关闭'}`);
      // 在实际项目中这里调用API
    },
    updateTask(updatedTask: Task) {
      const index = this.tasks.findIndex(t => t.id === updatedTask.id);
      if (index !== -1) {
        this.tasks[index] = updatedTask;
      }
    },
    showLogDetail(log: ExecutionLog) {
      this.selectedLog = log;
      this.logDrawerVisible = true;
    }
  }
});
