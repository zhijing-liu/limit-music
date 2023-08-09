// 获取屏幕刷新率
export const getFrame = async (precision = false) =>
  new Promise((resolve) => {
    let time = 0
    const RAF = () =>
      requestAnimationFrame(() => {
        time++
        RAFIns = RAF()
      })
    let RAFIns = RAF()
    setTimeout(() => {
      resolve(precision ? time : Math.round(time / 5) * 5)
    }, 1000)
  })
