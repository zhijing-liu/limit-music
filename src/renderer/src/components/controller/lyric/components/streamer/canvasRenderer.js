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
  data.y += 0.003 * data.size * renderData.speed
  const { size, x, y } = data
  ctx.fillStyle = 'rgba(165,222,228,.5)'
  if (renderData.blur) {
    ctx.filter = `blur(${3 - size}px)`
  }
  ctx.fillRect(x * renderData.canvasRect.width, y * renderData.canvasRect.height, size, 5 * size)
}
const drawStarUnit = (ctx, data) => {
  data.y += 0.001 * data.size * renderData.speed
  data.x -= 0.0003 * data.size * renderData.speed
  const { size, x, y } = data
  if (renderData.blur) {
    ctx.filter = `blur(${3 - size}px)`
  }
  ctx.drawImage(
    renderData.starImageBitMap,
    x * renderData.canvasRect.width * 1.5,
    y * renderData.canvasRect.height,
    5 * size,
    5 * size
  )
}

const drawSnowUnit = (ctx, data) => {
  data.y += 0.001 * data.size * renderData.speed
  data.x -= 0.0003 * data.size * renderData.speed * data.skew
  const { size, x, y } = data
  if (data.blur) {
    ctx.filter = `blur(${3 - size}px)`
  }
  ctx.drawImage(
    renderData.snowImageBitMap,
    x * renderData.canvasRect.width * 1.5,
    y * renderData.canvasRect.height,
    5 * size,
    5 * size
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
      if (t % 10 === 0) {
        for (let i = 0; i < renderData.count; i++) {
          streamerUnits[new Date().getTime() + i] = {
            x: Math.random(),
            y: -0.1,
            size: Math.random() * 2 + 0.5,
            skew: Math.random()
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
