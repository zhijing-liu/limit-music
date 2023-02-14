export const getTime = (length, toString) => {
  const data = {
    second: (length % 60).toFixed().padStart(2, '0'),
    minute: Math.floor(length / 60)
      .toFixed()
      .padStart(2, '0')
  }
  if (toString) {
    return `${data.minute}:${data.second}`
  } else {
    return data
  }
}
export class Throttling {
  fn
  idle = true
  lastArg
  delay
  constructor(fn, delay = 400) {
    this.fn = fn
    this.delay = delay
  }

  implement(...arg) {
    this.lastArg = arg
    if (this.idle) {
      this.fn(...arg)
      this.idle = false
      setTimeout(() => {
        // this.fn(...this.lastArg)
        this.idle = true
      }, this.delay)
    }
  }
}
