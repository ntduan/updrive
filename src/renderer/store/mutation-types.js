// mutations

export const CLEAR_USER_INFO = 'CLEAR_USER_INFO' // 清除用户信息

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS' // 登录成功
export const SET_USER_INFO = 'SET_USER_INFO' // 设置用户信息
export const SET_LOADING_LIST = 'SET_LOADING_LIST' // 目录正在加载中
export const SET_CURRENT_LIST = 'SET_CURRENT_LIST' // 设置当前目录列表
export const SET_SORT_INFO = 'SET_SORT_INFO' // 排序key
export const CHANGE_DIR = 'CHANGE_DIR' // 改变当前目录
export const SHORTCUT_SELECT_ALL = 'SHORTCUT_SELECT_ALL' // 选择所有文件
export const SET_SELECT_LIST = 'SET_SELECT_LIST' // 选择所有文件

export const OPEN_PROFILE_MODAL = 'OPEN_PROFILE_MODAL' // 打开用户设置 modal
export const OPEN_CREATE_FOLDER_MODAL = 'OPEN_CREATE_FOLDER_MODAL' // 打开创建文件夹 modal
export const CLOSE_CREATE_FOLDER_MODAL = 'CLOSE_CREATE_FOLDER_MODAL' // 关闭创建文件夹 modal

export const CLOSE_PROFILE_MODAL = 'CLOSE_PROFILE_MODAL' // 关闭用户设置 modal
export const OPEN_RENAME_FILE_MODAL = 'OPEN_RENAME_FILE_MODAL' // 打开重命名 modal
export const CLOSE_RENAME_FILE_MODAL = 'CLOSE_RENAME_FILE_MODAL' // 关闭重命名 modal

export const RENAME_FILE_SET_OLD_PATH = 'RENAME_FILE_SET_OLD_PATH' // 设置 oldpath
export const RENAME_FILE_CLEAR_OLD_PATH = 'RENAME_FILE_CLEAR_OLD_PATH' // 清除 oldpath

export const SHOW_TASK_MODAL = 'SHOW_TASK_MODAL' // 显示任务框
export const HIDE_TASK_MODAL = 'HIDE_TASK_MODAL' // 隐藏任务框
export const DELETE_TASK = 'DELETE_TASK' // 删除任务
export const UPDATE_TASK = 'UPDATE_TASK' // 更新任务
export const CANCEL_TASK = 'CANCEL_TASK' // 取消任务

export const INIT_JOB = 'INIT_JOB' // 初始化任务实例
export const SET_JOB_LIST = 'SET_JOB_LIST' // 设置任务列表
export const UPDATE_JOB_ITEM = 'UPDATE_JOB_ITEM' // 更新一个任务
export const CLEAR_COMPLEATE_JOB = 'CLEAR_COMPLEATE_JOB' // 清空已完成任务
export const SELECT_TAB_KEY = 'SELECT_TAB_KEY' // 设置 task tab key

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

export const SYNC_JOB_LIST = 'SYNC_JOB_LIST' // 同步下载任务列表