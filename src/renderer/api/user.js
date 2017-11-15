import UpyunClient from '@/api/upyunClient'

export default class User {
  constructor(bucketName, operatorName, password) {
    this.bucketName = bucketName
    this.operatorName = operatorName
    this.password = password
    this.client = new UpyunClient(this.bucketName, this.operatorName, this.password)
  }
}