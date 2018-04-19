import { winShow } from '@/api/electron'

export default {
  notify(title = 'Updrive', options = {}, onClick) {
    const notify = new Notification(title, options)

    notify.onclick = (...arg) => {
      onClick(...arg)
      winShow()
    }
  },
}
