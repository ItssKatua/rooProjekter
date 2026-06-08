import { onMounted, onUnmounted } from 'vue'
import { getToken } from './api.js'

const BASE = 'http://localhost:3000'

let es = null
let refCount = 0
const handlers = new Map() // event -> Set of callbacks

function connect() {
  if (es) return
  const token = getToken()
  if (!token) return

  es = new EventSource(`${BASE}/sse?token=${encodeURIComponent(token)}`)

  es.onerror = () => {
    es?.close()
    es = null
    // reconnect after 5s
    setTimeout(() => {
      if (refCount > 0) connect()
    }, 5000)
  }

  // route events to registered handlers
  const EVENTS = [
    'post:created',
    'post:updated',
    'post:deleted',
    'post:reacted',
    'comment:created',
    'comment:deleted',
    'employee:updated',
    'employee:admin-updated',
    'employee:deleted',
  ]


  EVENTS.forEach((evt) => {
    es.addEventListener(evt, (e) => {
      const data = JSON.parse(e.data)
      handlers.get(evt)?.forEach((cb) => cb(data))
    })
  })
}

function disconnect() {
  if (refCount > 0) return
  es?.close()
  es = null
}

/**
 * useSSE — register SSE event listeners, auto-cleanup on unmount.
 *
 * @param {Record<string, (data: any) => void>} eventMap
 */
export function useSSE(eventMap) {
  onMounted(() => {
    refCount++
    connect()

    for (const [evt, cb] of Object.entries(eventMap)) {
      if (!handlers.has(evt)) handlers.set(evt, new Set())
      handlers.get(evt).add(cb)
    }
  })

  onUnmounted(() => {
    for (const [evt, cb] of Object.entries(eventMap)) {
      handlers.get(evt)?.delete(cb)
    }
    refCount--
    if (refCount <= 0) {
      refCount = 0
      disconnect()
    }
  })
}