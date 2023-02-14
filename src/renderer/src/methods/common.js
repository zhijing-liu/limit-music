export const getTime = (length) => ({
  second: length % 60,
  minute: Math.floor(length / 60)
})
