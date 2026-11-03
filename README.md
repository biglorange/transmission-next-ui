<h1 align="center" style="border-bottom: none;"><img src="public/favicon.svg" width="24" style="vertical-align: middle; margin-right: 8px;" /> Transmission Next UI</h1>
<h3 align="center"> 一个Transmission的第三方Web UI，使用shadcn/ui和Vite构建。</h3>

<p align="center">
  <img alt="GitHub License" src="https://img.shields.io/github/license/biglorange/transmission-next-ui">
  <img alt="GitHub Release" src="https://img.shields.io/github/release/biglorange/transmission-next-ui">
  <img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/biglorange/transmission-next-ui/build.yml?branch=main">
</p>

> **Fork 说明**：本仓库是 [hisproc/transmission-next-ui](https://github.com/hisproc/transmission-next-ui) 的 Fork，代码托管与 Release 发布均已适配到 [biglorange/transmission-next-ui](https://github.com/biglorange/transmission-next-ui)。安装脚本、徽章、版本检查及下载地址均指向本 Fork。

---

## 技术栈

- **前端框架**: [React 19](https://react.dev/) + [Vite 7](https://vite.dev/)
- **CSS 框架**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **组件库**: [shadcn/ui](https://ui.shadcn.com/)
- **图标库**: [Lucide React](https://lucide.dev/)
- **路由管理**: [React Router 7](https://reactrouter.com/)

---

简体中文 | [English](README_EN.md)


## 预览

[**在线演示 (Live Demo)**](https://transmission-next-ui-demo.pages.dev)（上游演示）

| Light Mode | Dark Mode |
| :---: | :---: |
| ![dashboard_light.png](pic/dashboard_light.png) | ![dashboard_dark.png](pic/dashboard_dark.png) |

| Torrent Details | Settings |
| :---: | :---: |
| ![torrent_details.png](pic/torrent_details.png) | ![settings.png](pic/settings.png) |

## 功能

- 现代化 UI 设计
- 响应式布局，适配所有设备
- 适配 Transmission 4.0+ 版本
- [x] 种子管理，信息查看
- [x] 配置设置
- [x] 拖拽/粘贴添加种子
- [x] 深色模式支持
- [x] Tracker 过滤
- [x] 支持种子标签
- [x] 批量替换 Tracker
- [x] 批量移动下载目录
- [x] 批量设置种子标签

⚠️本项目为早期版本，尚未经过完整测试，正式使用前请自行验证其功能是否符合预期。

## 快速开始

可以通过三种方式部署 Transmission Next UI，另外提供对于[群辉](doc/NasInstall.md#群辉)和[飞牛OS](doc/NasInstall.md#飞牛OS)的安装指引:

### 1. 一键安装

> 依赖环境：`docker`、`docker-compose` 和 `curl`

> [!TIP]
> 建议先创建一个专用目录来存放相关文件，例如：
> ```bash
> mkdir -p ~/transmission && cd ~/transmission
> ```

初次安装或升级到最新版本，运行以下命令：

```bash
curl -fsSL https://raw.githubusercontent.com/biglorange/transmission-next-ui/main/download.sh | bash
```

执行后将在当前目录生成一个 `docker-compose.yml` 文件。

编辑该文件来自定义 Transmission 的用户名、密码和时区：

```yaml
environment:
  - USER=your-username
  - PASS=your-password
  - TZ=Asia/Shanghai
```

然后通过以下命令启动或停止服务：

```bash
docker-compose up -d   # 后台启动
docker-compose down    # 停止并移除容器
```

默认使用端口映射方式，映射了以下两个端口：

| 端口 | 协议 | 用途 |
| --- | --- | --- |
| `9091` | TCP | Web UI 及 RPC 接口，启动后通此端口访问 Web UI（如 `http://localhost:9091`） |
| `51413` | TCP/UDP | BT 数据传输端口，用于与其他节点交换数据 |

如果修改了 Transmission 在 config 目录下的配置文件中的端口设置，请确保在 `docker-compose.yml` 中也做相应修改。

### 2. 手动安装

1. 打开 [Releases](https://github.com/biglorange/transmission-next-ui/releases) 页面
2. 下载最新或稳定版本（如 `release.zip`）
3. 解压并将其中的内容复制到 Transmission 的 Web 目录（如 `transmission/web/src`）

### 3. 源代码打包

```bash
git clone git@github.com:biglorange/transmission-next-ui.git
cd transmission-next-ui
pnpm install
pnpm build
```

构建完成后，将 `dist/` 目录下的所有内容复制到 Transmission 的 Web 目录下即可。

## 发布与维护

本仓库使用 GitHub Actions 自动构建和发布，工作流位于 `.github/workflows/`：

| 工作流 | 触发方式 | 作用 |
| --- | --- | --- |
| `build.yml` | 推送到 `main`、PR、手动触发 | 安装依赖、Lint、运行测试、构建，并上传 `dist` 构建产物 |
| `release.yml` | 推送 `v*` 标签、手动触发 | 运行测试、构建并创建 GitHub Release，附带 `release.zip` 与校验文件 |

发布新版本（二选一）：

1. **手动触发（推荐）**：在 GitHub 仓库的 **Actions → Release → Run workflow** 中，选择 `main` 分支并填写版本号（如 `0.4.0`），工作流会自动创建 `v0.4.0` 标签并发布 Release。
2. **推送标签**：`git tag v0.4.0 && git push origin v0.4.0`。

发布前请先把 `package.json` 中的 `version` 更新为对应版本。Release 中的 `release.zip` 即为一键安装脚本和手动安装所使用的压缩包。

> [!IMPORTANT]
> 首次发布前，请确认仓库 **Settings → Actions → General → Workflow permissions** 已选择 **Read and write permissions**，否则 `release.yml` 无法创建 Release。

更完整的发布、版本号、上游同步与备份分支说明见 [doc/Release.md](doc/Release.md)。

## 许可证

本项目采用 [MIT 许可证](LICENSE) 进行授权。
