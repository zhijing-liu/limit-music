export class Worker {
  worker
  eventFn
  constructor(Source, eventFn) {
    this.eventFn = eventFn
    this.worker = new Source()
    this.worker.addEventListener('message', (event) => {
      try {
        event.data = JSON.parse(event.data)
      } catch {}
      const { eventName, data } = event.data
      eventFn[eventName]?.(data)
    })
  }

  postMessage(eventName, data) {
    this.worker.postMessage(
      JSON.stringify({
        eventName,
        data
      })
    )
  }
}
