// SSE client registry
// Each client is a WritableStreamDefaultWriter

type SSEClient = {
  id: string
  send: (data: string) => void
  close: () => void
}

const clients = new Set<SSEClient>()

export function addSSEClient(client: SSEClient) {
  clients.add(client)
}

export function removeSSEClient(client: SSEClient) {
  clients.delete(client)
}

export function broadcast(event: string, data: unknown) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  clients.forEach((client) => {
    try {
      client.send(msg)
    } catch {
      clients.delete(client)
    }
  })
}