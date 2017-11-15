import message from 'iview/src/components/message'

export default {
  info(config) {
    return message.info(config)
  },
  success(config) {
    return message.success(config)
  },
  warning(config) {
    if (typeof config === 'string') return message.warning({
      content: config,
      duration: 5,
    })
    if (typeof config === 'object') return message.warning({
      duration: 5,
      ...config,
    })
  },
  error(config) {
    if (typeof config === 'string') return message.error({
      content: config,
      duration: 5,
    })
    if (typeof config === 'object') return message.error({
      duration: 5,
      ...config,
    })
  },
  loading(config) {
    return message.loading(config)
  },
}