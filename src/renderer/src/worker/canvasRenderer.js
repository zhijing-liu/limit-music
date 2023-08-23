let RAF
const frameElapse = (fn) => {
  RAF = requestAnimationFrame(() => {
    fn()
    frameElapse(fn)
  })
}
let renderData = {
  canvasRect: {
    width: 0,
    height: 0
  },
  blur: false,
  speed: 1,
  count: 1,
  type: 'none',
  starImage: null,
  snowImage: null
}
const canvasRenderer = new OffscreenCanvas(
  renderData.canvasRect.width,
  renderData.canvasRect.height
)
const drawRainUnit = (ctx, data) => {
  ctx.fillStyle = 'rgba(255,255,255,.5)'
  if (renderData.blur) {
    ctx.filter = `blur(${3 - data.size}px)`
  }
  ctx.fillRect(
    data.x * renderData.canvasRect.width,
    (data.y + ((data.size * renderData.speed) / 2000) * (Date.now() - data.t)) *
      renderData.canvasRect.height,
    data.size,
    5 * data.size
  )
}
const drawStarUnit = (ctx, data) => {
  if (renderData.blur) {
    ctx.filter = `blur(${3 - data.size}px)`
  }
  ctx.drawImage(
    renderData.starImageBitMap,
    (data.x - ((data.size * renderData.speed) / 30000) * (Date.now() - data.t)) *
      renderData.canvasRect.width *
      1.5,
    (data.y + ((data.size * renderData.speed) / 10000) * (Date.now() - data.t)) *
      renderData.canvasRect.height,
    5 * data.size,
    5 * data.size
  )
}

const drawSnowUnit = (ctx, data) => {
  if (data.blur) {
    ctx.filter = `blur(${3 - data.size}px)`
  }
  ctx.drawImage(
    renderData.snowImageBitMap,
    (data.x - ((data.size * renderData.speed) / 30000) * (Date.now() - data.t) * data.skew) *
      renderData.canvasRect.width,
    (data.y + ((data.size * renderData.speed) / 10000) * (Date.now() - data.t)) *
      renderData.canvasRect.height,
    5 * data.size,
    5 * data.size
  )
}
const drawMap = {
  rain: drawRainUnit,
  star: drawStarUnit,
  snow: drawSnowUnit
}
const streamerUnits = {}
const eventMap = {
  start: async (data) => {
    await Promise.all([
      fetch(renderData.snowImage)
        .then((response) => response.blob())
        .then((blob) => createImageBitmap(blob))
        .then((imageBitmap) => {
          renderData.snowImageBitMap = imageBitmap
        }),
      fetch(renderData.starImage)
        .then((response) => response.blob())
        .then((blob) => createImageBitmap(blob))
        .then((imageBitmap) => {
          renderData.starImageBitMap = imageBitmap
        })
    ])
    let t = 0
    frameElapse(() => {
      const canvasRendererCtx = canvasRenderer.getContext('2d')
      canvasRendererCtx.clearRect(0, 0, renderData.canvasRect.width, renderData.canvasRect.height)
      canvasRenderer.width = renderData.canvasRect.width
      t++
      if (t % 20 === 0) {
        for (let i = 0; i < renderData.count; i++) {
          streamerUnits[new Date().getTime() + i] = {
            x: Math.random(),
            y: -0.1,
            size: Math.random() * 2 + 0.5,
            skew: Math.random() - 0.5,
            t: Date.now()
          }
        }
      }
      const fn = drawMap[renderData.type]
      for (const timeStep in streamerUnits) {
        const data = streamerUnits[timeStep]
        if (data.y > 1.1) {
          Reflect.deleteProperty(streamerUnits, timeStep)
        } else {
          fn(canvasRendererCtx, data)
        }
      }
      const message = {
        data: canvasRenderer.transferToImageBitmap(),
        eventName: 'updateBitMap'
      }
      self.postMessage(message, [message.data])
    })
  },
  changeData: (data) => {
    renderData = { ...renderData, ...data }
    canvasRenderer.width = renderData.canvasRect.width
    canvasRenderer.height = renderData.canvasRect.height
  },
  stop: () => {
    cancelAnimationFrame(RAF)
  }
}
addEventListener('message', (event) => {
  let eventData = event.data
  try {
    eventData = JSON.parse(eventData)
  } catch {}
  const { eventName, data } = eventData
  eventMap[eventName]?.(data)
})
