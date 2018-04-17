# updrive

> 又拍云文件管理桌面客户端
#### ChangeLog

##### v0.31.0
  - 绕过防盗链限制预览图片

##### v0.30.0
  - 修复不同账号切换存在的一些 BUG
  - 手动更新功能
  - 增加用户名服务名展示以及设置功能
  - 增加云存储服务使用量展示

#### Download
[下载地址](https://github.com/aniiantt/updrive/releases)

#### Usage
[云存储服务及操作员账号创建](https://console.upyun.com/services/create/file/)

#### Screenshot
![截图1](https://github.com/aniiantt/updrive/blob/develop/static/screenshot1.png?raw=true)
![截图2](https://github.com/aniiantt/updrive/blob/develop/static/screenshot2.png?raw=true)
![截图3](https://github.com/aniiantt/updrive/blob/develop/static/screenshot3.png?raw=true)

#### Build

``` bash
# 安装依赖
yarn

# 启动
yarn dev

# 打包
yarn build

```

#### Feature
- 基础的文件上传、下载、删除、重命名、查看功能
- 按名称、日期、类型、大小排序
- 批量删除、新建和上传
- 拖曳操作
- 复制链接
- 查看文件响应头
- 多选删除上传
- 上传下载展示，以及历史记录
- 账号历史
- 右键菜单
- 快捷键操作
- 前进，后退功能

#### TODO
- [ ] 版本号显示以及检查更新功能
- [ ] 托盘图标
- [ ] 列表卡片查看模式，以及瀑布流加载
- [ ] 优化文件查看体验
- [ ] 自定义域名
- [ ] 自动更新
- [ ] 截图上传
- [ ] 文件拉取
- [ ] 云处理功能
