import {readdirSync} from 'node:fs'
import {join} from 'node:path'
import {fileURLToPath} from "node:url";
import {exec} from 'node:child_process'

const path = join(fileURLToPath(import.meta.url), '../')
const dirs = readdirSync(path, {
  withFileTypes: true
}).filter((dirent) => dirent.isDirectory())

const promiseList = dirs.map((dirent) => new Promise((resolve, reject) => {
  const command = `npm run init-dependence --prefix=${join(path, dirent.name)}`
  exec(command, (error) => {
    if (error) {
      reject(`command : ${command} , error:${error}`)
    } else {
      resolve(`command : ${command} , success`)
    }
  })
}))
const result = await Promise.allSettled(promiseList)
result.forEach(item => {
    console.log(`\x1B[${item.status==='fulfilled'?'36':'31'}m%s\x1B[0m`,item.value??item.reason)
})

