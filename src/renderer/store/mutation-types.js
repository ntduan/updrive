// mutations

export const CLEAR_USER_INFO = 'CLEAR_USER_INFO' // 清除用户信息


export const RESET_AUTH = 'RESET_AUTH'
export const RESET_LIST = 'RESET_LIST'
export const RESET_MODAL = 'RESET_MODAL'
export const RESET_TASK = 'RESET_TASK'
export const RESET_PROFILE = 'RESET_PROFILE'

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS' // 登录成功
export const LOGOUT = 'LOGOUT' // 退出登录
export const SET_USER_INFO = 'SET_USER_INFO' // 设置用户信息
export const SET_LOADING_LIST = 'SET_LOADING_LIST' // 目录正在加载中
export const SET_CURRENT_LIST = 'SET_CURRENT_LIST' // 设置当前目录列表
export const SET_SORT_INFO = 'SET_SORT_INFO' // 排序key
export const CHANGE_DIR = 'CHANGE_DIR' // 改变当前目录
export const SHORTCUT_SELECT_ALL = 'SHORTCUT_SELECT_ALL' // 选择所有文件
export const SET_SELECT_LIST = 'SET_SELECT_LIST' // 选择所有文件

export const OPEN_CREATE_FOLDER_MODAL = 'OPEN_CREATE_FOLDER_MODAL' // 打开创建文件夹 modal
export const CLOSE_CREATE_FOLDER_MODAL = 'CLOSE_CREATE_FOLDER_MODAL' // 关闭创建文件夹 modal

export const OPEN_RENAME_FILE_MODAL = 'OPEN_RENAME_FILE_MODAL' // 打开重命名 modal
export const CLOSE_RENAME_FILE_MODAL = 'CLOSE_RENAME_FILE_MODAL' // 关闭重命名 modal

export const RENAME_FILE_SET_OLD_PATH = 'RENAME_FILE_SET_OLD_PATH' // 设置 oldpath
export const RENAME_FILE_CLEAR_OLD_PATH = 'RENAME_FILE_CLEAR_OLD_PATH' // 清除 oldpath

export const OPEN_DOMAIN_SETTING_MODAL = 'OPEN_DOMAIN_SETTING_MODAL' // 打开域名设置框
export const CLOSE_DOMAIN_SETTING_MODAL = 'CLOSE_DOMAIN_SETTING_MODAL' // 关闭域名设置框

export const OPEN_FORMAT_URL_MODAL = 'OPEN_FORMAT_URL_MODAL' // 打开链接格式化框
export const CLOSE_FORMAT_URL_MODAL = 'CLOSE_FORMAT_URL_MODAL' // 关闭链接格式化框
export const SET_FORMAT_TYPE = 'SET_FORMAT_TYPE' // 设置链接的格式
export const SET_COPY_URL = 'SET_COPY_URL' // 设置需要复制的URL

export const SHOW_TASK_MODAL = 'SHOW_TASK_MODAL' // 显示任务框
export const HIDE_TASK_MODAL = 'HIDE_TASK_MODAL' // 隐藏任务框

export const INIT_JOB = 'INIT_JOB' // 初始化任务实例
export const SET_JOB_LIST = 'SET_JOB_LIST' // 设置任务列表
export const UPDATE_JOB_ITEM = 'UPDATE_JOB_ITEM' // 更新一个任务
export const DELETE_JOB = 'DELETE_JOB' // 删除任务
export const SYNC_JOB_LIST = 'SYNC_JOB_LIST' // 同步下载任务列表

// actions
export const VERIFICATION_ACCOUNT = 'VERIFICATION_ACCOUNT' // 验证账号
export const GET_LIST_DIR_INFO = 'GET_LIST_DIR_INFO' // 获取列表信息
export const UPLOAD_FILES = 'UPLOAD_FILES' // 上传文件
export const CREATE_FOLDER = 'CREATE_FOLDER' // 创建文件夹
export const REFRESH_LIST = 'REFRESH_LIST' // 刷新当前目录
export const DELETE_FILE = 'DELETE_FILE' // 删除文件
export const RENAME_FILE = 'RENAME_FILE' // 重命名文件
export const DOWNLOAD_FILES = 'DOWNLOAD_FILES' // 下载文件
export const GET_FILE_DETAIL_INFO = 'GET_FILE_DETAIL_INFO' // 获取文件详情信息
export const SET_FILE_DETAIL_INFO = 'SET_FILE_DETAIL_INFO' // 设置文件详情信息

export const INIT_PROFILE = 'INIT_PROFILE' // 初始化 profile
export const SET_PROFILE_STORE = 'SET_PROFILE_STORE' // 设置 profile 存储数据
export const SET_PROFILE_DATA = 'SET_PROFILE_DATA' // 同步 profile 数据
export const SYNC_PROFILE_DATA = 'SYNC_PROFILE_DATA' // 设置 profile 数据

export const SET_USAGE = 'SET_USAGE' // 设置空间使用量
export const GET_USAGE = 'GET_USAGE' // 获取空间使用量
