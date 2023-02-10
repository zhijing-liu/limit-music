const { resolve } = require('path')

module.exports = {
  resolve: {
    // 处理路径无后缀的情况
    extensions: ['.js', '.json', '.vue'],
    // 此配置和 vue.config.js 中的保持一致
    alias: {
      '@': resolve(__dirname, './src/renderer/src')
    }
  }
}
