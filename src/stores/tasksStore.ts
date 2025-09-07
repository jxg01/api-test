import { defineStore } from 'pinia';
import { scheduleTasksApi } from '@/api'
import { useProjectStore } from './project'

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
  schedule?: number;
  total?: number;
  passed?: number;
  failed?: number;
  error?: number;
  success_rate?: number;
  schedule_name: string;
  start_time: string;
  end_time: string;
  status: 'completed' | 'error' | 'running';
  duration: number;
  trigger: string;
  created_at: string;
  executor: string;
  test_cases_result: any[];
}



export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [] as Task[],
    selectedTaskId: null as number | null,
    executionHistory: [
      {
            "id": 18,
            "schedule": 1,
            "schedule_name": "冒烟测试，每天早上8点10ewqw",
            "start_time": "2025-08-23 00:46:00",
            "end_time": "2025-08-23 00:46:22",
            "duration": 22.42,
            "executor": "System",
            "trigger": "auto",
            "created_at": "2025-08-23 00:46:00",
            "total": 2,
            "passed": 1,
            "failed": 1,
            "success_rate": 50.0,
            "status": "completed"
        },
      {
            "id": 17,
            "schedule": 1,
            "schedule_name": "冒烟测试，每天早上8点10ewqw",
            "start_time": "2025-08-23 00:43:00",
            "end_time": "2025-08-23 00:43:22",
            "duration": 22.346,
            "executor": "System",
            "trigger": "auto",
            "created_at": "2025-08-23 00:43:00",
            "total": 2,
            "passed": 1,
            "failed": 1,
            "success_rate": 50.0,
            "status": "completed"
        },
    ] as ExecutionLog[],
    logDrawerVisible: false,
    selectedLog: {} as ExecutionLog,
    loading: false,
    currentPage: 1,
    pageSize: 10,
    total: 0,
  }),
  getters: {
    selectedTask(): Task | null {
      return this.tasks.find(task => task.id === this.selectedTaskId) || this.tasks[0] || null;
    },
    filteredHistory(): ExecutionLog[] {
      if (!this.selectedTaskId) return [];
      return this.executionHistory.filter(h => h.schedule === this.selectedTaskId);
    }
  },
  actions: {
    async selectTask(taskId: number) {
      this.selectedTaskId = taskId;
      // 切换任务后立即刷新执行历史数据
      await this.fetchExecutionHistory();
    },
    updateTaskStatus(task: Task) {
      console.log(`更新任务状态: ${task.name} -> ${task.enabled ? '开启' : '关闭'}`);
      // 在实际项目中这里调用API
    },
    async updateTask(updatedTask: Task) {
      // 在实际项目中这里调用API
      const { id, ...updateData } = updatedTask;
      const projectStore = useProjectStore()
      await projectStore.ensureReady()
      const taskWithProject = {
        ...updateData,
        project: projectStore.currentProjectId
      }
      const res = await scheduleTasksApi.editScheduleTask(id, taskWithProject);
      if (!res) {
        console.error('更新任务失败');
        return;
      }
      const index = this.tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        this.tasks[index] = { ...this.tasks[index], ...updateData };
      }
      await this.fetchTasksList(); // 刷新任务列表
    },
    showLogDetail(log: ExecutionLog) {
      this.selectedLog = log;
      this.logDrawerVisible = true;
    },
    async fetchTasksList() {
      try {
        const projectStore = useProjectStore()
        await projectStore.ensureReady()
        const params = {
          project_id: projectStore.currentProjectId
        }
        const res = await scheduleTasksApi.getScheduleTasksList(params)
        this.tasks = res.data
        
        // 确保在任务列表加载后，如果有任务但没有选中的任务，则自动选中第一个任务并获取其执行历史
        if (this.tasks.length > 0 && (!this.selectedTaskId || !this.tasks.find(t => t.id === this.selectedTaskId))) {
          this.selectedTaskId = this.tasks[0].id
          // 选中任务后获取其执行历史
          await this.fetchExecutionHistory()
        }
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
        const projectStore = useProjectStore()
        await projectStore.ensureReady()
        const taskWithProject = {
          ...newTask,
          project: projectStore.currentProjectId
        }
        const res = await scheduleTasksApi.createScheduleTask(taskWithProject);
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
    },

    async fetchExecutionHistory() {
      try {
        this.loading = true;
        const projectStore = useProjectStore()
        await projectStore.ensureReady()
        const params = {
          page: this.currentPage,
          size: this.pageSize,
          schedule_id: this.selectedTaskId,
          project_id: projectStore.currentProjectId
        }
        const res = await scheduleTasksApi.getScheduleTaskLogs(params);
        console.log('res', res)
        this.executionHistory = res.data;
        this.total = res.meta.pagination.total;
        this.currentPage = res.meta.pagination.page;
        this.pageSize = res.meta.pagination.per_page;

        // console.log('获取执行历史成功:', res.data);
        console.log('获取执行历史成功 === ');
      } catch (error) {
        console.error('获取执行历史失败', error);
      } finally {
        this.loading = false;
      }
    },

    setCurrentPage(page: number) {
      this.currentPage = page
      this.fetchExecutionHistory()
    },

    setPageSize(size: number) {
      console.log('setPageSize size', size)
      this.pageSize = size
      this.currentPage = 1
      this.fetchExecutionHistory()
    },

  }
});
