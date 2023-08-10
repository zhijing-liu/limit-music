export const directive = (app) => {
  app.directive('load', {
    created: (el, { value }, vnode, prevVnode) => {
      value?.(el)
    }
  })
}
