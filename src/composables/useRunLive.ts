// src/composables/useRunLive.ts
import { ref } from 'vue'

export type RunEvent =
  | { type: 'start' | 'finish' | 'progress'; [k: string]: any }
  | { type: 'step_start' | 'step_end'; idx: number; name?: string; status?: string; screenshot?: string; error?: string }
  | { type: 'frame'; idx: number; img_b64: string }

export function useRunLive() {
  const wsRef = ref<WebSocket | null>(null)
  const images = ref<string[]>([])
  const logs = ref<RunEvent[]>([])
  const status = ref<'pending' | 'running' | 'success' | 'failed'>('pending')
  const progress = ref({ finished: 0, total: 0 })

  function connect(runId: string) {
    disconnect() // 避免重复连接
    images.value = []
    logs.value = []
    status.value = 'pending'
    progress.value = { finished: 0, total: 0 }

    // const proto = location.protocol === 'https:' ? 'wss' : 'ws'
    // const url = `${proto}://${location.host}/ws/run/${runId}/`
    // const url = `ws://192.168.41.52:8000/ws/run/${runId}/`
    const url = `ws://127.0.0.1:8001/ws/run/${runId}/`
    const ws = new WebSocket(url)
    wsRef.value = ws

    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data) as RunEvent
      logs.value.push(msg)

      if (msg.type === 'start') status.value = 'running'
      if (msg.type === 'progress') progress.value = { finished: msg.finished ?? progress.value.finished, total: msg.total ?? progress.value.total }
      if (msg.type === 'finish') status.value = (msg.status as any) || 'success'

      // 截图帧（URL 或 base64）
      const shot = (msg as any).screenshot || (msg as any).img_b64
      if (shot) images.value.push(shot)
    }

    ws.onerror = () => {
      // 仅记录，避免对用户打扰；需要可加 ElMessage.error
      logs.value.push({ type: 'frame', idx: -1, img_b64: '', error: 'WebSocket error' } as any)
    }

    ws.onclose = () => {
      wsRef.value = null
    }
  }

  function disconnect() {
    try { wsRef.value?.close() } catch {}
    wsRef.value = null
  }

  return { connect, disconnect, images, logs, status, progress }
}
