import {
  path,
  split,
  map,
  zipObj,
  compose,
  objOf,
  ifElse,
  isEmpty,
  assoc,
  replace,
  converge,
  always,
  prop,
  concat,
  identity,
  __,
  equals,
} from 'ramda'
import Moment from 'moment'
import Ftp from 'ftp'

export default {
  setup(bucketName, operatorName, password) {
    const ftpClient = new Ftp()
    ftpClient.on('ready', () => {
      console.info('--------------- ftp 连接成功 ---------------')
    })
    ftpClient.on('close', error => {
      console.info('--------------- ftp 已关闭 ---------------')
    })

    const connect = async () => {
      return new Promise((resolve, reject) => {
        ftpClient.connect({
          host: 'v0.ftp.upyun.com',
          user: `${operatorName}/${bucketName}`,
          password: password,
        })
        ftpClient.once('ready', resolve)
      })
    }

    const renamePromise = (oldPath, newPath) => {
      return new Promise(async (resolve, reject) => {
        ftpClient.rename(oldPath, newPath, err => {
          if (err) reject(err)
          resolve()
        })
      })
    }

    this.renameFile = async (oldPath, newPath) => {
      await connect()
      return renamePromise(oldPath, newPath)
        .then(() => {
          console.info('路径修改成功', `${oldPath} => ${newPath}`)
          ftpClient.end()
          return Promise.resolve(newPath)
        })
        .catch(err => {
          ftpClient.end()
          return Promise.reject(err)
        })
    }
  }
}
