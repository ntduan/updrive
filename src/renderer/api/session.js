export default {
  setUser(userInfo) {
    sessionStorage.setItem('currentUser', JSON.stringify(userInfo))
  },
  getUser() {
    let userInfo
    try {
      const _userInfo = sessionStorage.getItem('currentUser')
      if (_userInfo) userInfo = JSON.parse(_userInfo)
    } catch (err) {
      userInfo = null
    }
    return userInfo
  },
  clear() {
    sessionStorage.removeItem('currentUser')
  },
}