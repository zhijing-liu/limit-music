import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {readdirSync} from "node:fs";

const path = join(fileURLToPath(import.meta.url), '../')

const entry = {}
readdirSync(path, {
  withFileTypes: true
}).forEach((dirent) => {
  if (dirent.isDirectory()) {
    entry[dirent.name] = join(path, dirent.name, './index.js')
  }
})

export default {
  entry,
  mode: 'development',
  externalsPresets: {node: true},
  output: {
    filename: "./[name]/dist/index.js",
    path,
    library: 'zhijing',
    libraryTarget: "umd"
  },
}
//   fork(`${join(path,'./ipConfig/index.mjs')}`).on('message',function (data){
//     console.log(data)
//     console.log(this)
//   })
