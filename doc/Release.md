# 发布与仓库维护

本文说明 `biglorange/transmission-next-ui` 这个 Fork 的 Release 流程、版本号注入方式，以及与上游仓库同步和备份分支的用法。

## 仓库与分支约定

| 名称 | 地址 | 用途 |
| --- | --- | --- |
| `origin` | `https://github.com/biglorange/transmission-next-ui.git` | 本 Fork，用于日常开发和发布 |
| `upstream` | `https://github.com/hisproc/transmission-next-ui.git` | 原始仓库，仅用于同步上游代码 |
| `main` | `origin/main` | 本 Fork 的主分支，GitHub Actions 在此构建 |
| `backup/main-before-release-ci` | 本地分支，指向 `244f43f` | 改造 Release 流程前的 `main` 备份，可用于对比或向上游提交 |

备份分支在改造前创建，保留了 Fork 相对上游新增的两个提交：

```bash
git log --oneline upstream/main..backup/main-before-release-ci
# 244f43f feat: add torrent status and label filters
# 84f1c8d feat: improve torrent file and page selection
```

如需把备份分支推送到 GitHub 作为远端备份：

```bash
git push -u origin backup/main-before-release-ci
```

## 首次配置

1. 确认 Fork 仓库的 **Actions** 已启用（Fork 首次进入 Actions 页面时可能需要点击启用）。
2. 打开 **Settings → Actions → General → Workflow permissions**，选择 **Read and write permissions**。
   `release.yml` 已声明 `permissions: contents: write`，但仓库策略必须允许写入，否则创建 Release 会报 `Resource not accessible by integration`。
3. 不需要额外配置 Personal Access Token，工作流使用内置的 `GITHUB_TOKEN`。

## 工作流说明

| 文件 | 触发条件 | 行为 |
| --- | --- | --- |
| `.github/workflows/build.yml` | 推送到 `main`、针对 `main` 的 PR、手动触发 | `pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm test` → `pnpm build`，并上传 `transmission-next-ui-dist` 构建产物 |
| `.github/workflows/release.yml` | 推送 `v*` 标签、手动触发 | 解析版本号 → 安装依赖 → `pnpm test` → 构建 → 生成 `release.zip` / `release.zip.sha256` → 创建 GitHub Release |
| `.github/release.yml` | Release 生成说明时自动读取 | 按标签对自动生成的 Release Notes 分类 |

`build.yml` 不会创建 Release；发布动作统一由 `release.yml` 完成，避免每次推送 `main` 都产生一个版本。

## 发布新版本

### 1. 更新版本号

修改 `package.json` 的 `version`，例如：

```json
"version": "0.4.0"
```

`vite.config.ts` 会读取它作为本地开发时的默认版本；正式构建时由工作流通过 `VITE_APP_VERSION` 覆盖，因此前端显示的版本始终与 Release 标签一致。

### 2. 提交并推送 `main`

```bash
git add package.json
git commit -m "chore: release v0.4.0"
git push origin main
```

### 3. 触发发布（二选一）

**方式 A：手动触发（推荐）**

1. 打开 GitHub 仓库的 **Actions → Release → Run workflow**。
2. 分支选择 `main`。
3. `version` 填写 `0.4.0`（不要带 `v`，带 `v` 也可以）。
4. 如为预发布版本，勾选 `prerelease`。
5. 点击 **Run workflow**。

工作流会自动创建并推送 `v0.4.0` 标签，然后基于该提交创建 Release。

**方式 B：推送标签**

```bash
git tag v0.4.0
git push origin v0.4.0
```

> [!WARNING]
> 本地已通过 `git fetch upstream --tags` 同步了上游的历史标签（`v0.1.0`–`v0.3.4`）。不要执行 `git push --tags`，否则会把上游历史标签推到本 Fork，并可能触发旧标签对应的发布工作流。只推送本次要发布的标签，例如 `git push origin v0.4.0`。

两种方式都会产生以下 Release 资产：

| 资产 | 说明 |
| --- | --- |
| `release.zip` | 网站静态文件压缩包，`download.sh` 和手动安装均使用它 |
| `release.zip.sha256` | 压缩包校验文件 |

> 注意：通过 `GITHUB_TOKEN` 创建的标签不会再次触发标签推送工作流，因此手动触发不会重复发布。若改用 Personal Access Token 创建标签，需自行避免重复触发。

### 4. 验证

- Release 页面能看到 `v0.4.0`、`release.zip` 和自动生成的变更说明。
- 页面底部版本号显示为 `v0.4.0`。
- 一键安装脚本可用：

```bash
curl -fsSL https://raw.githubusercontent.com/biglorange/transmission-next-ui/main/download.sh | bash
```

`download.sh` 中的 `REPO` 已指向本 Fork，也支持临时覆盖：

```bash
REPO=biglorange/transmission-next-ui curl -fsSL ... | bash
```

## 版本号是如何注入的

1. `release.yml` 从标签或手动输入解析版本，设置环境变量 `VITE_APP_VERSION`。
2. `vite.config.ts` 读取 `VITE_APP_VERSION`；没有该变量时回退到 `package.json` 的 `version`。
3. Vite 通过 `define` 注入 `__APP_VERSION__`。
4. `src/lib/config.ts` 将其暴露为 `APP_CONFIG.version`，侧边栏和版本检查使用它。
5. `src/components/navbar.tsx` 通过 `APP_CONFIG.githubRepo` 查询本 Fork 的最新 Release。

因此不要手工修改 `src/lib/config.ts` 里的版本号，改 `package.json` 或发布标签即可。

## 常见问题

### Release 创建失败，提示 403 / Resource not accessible

到 **Settings → Actions → General → Workflow permissions** 开启 **Read and write permissions**，然后重新运行工作流。

### 标签已存在

手动填写的版本号如果已经存在对应标签，Release 会基于已有标签更新。若要重新发布同一版本，先删除旧标签和 Release：

```bash
git push origin :refs/tags/v0.4.0
git tag -d v0.4.0
```

然后在 GitHub Release 页面删除旧版本，再重新触发。更推荐直接发布新补丁版本。

### `pnpm install --frozen-lockfile` 失败

说明 `pnpm-lock.yaml` 与 `package.json` 不一致。本地执行：

```bash
pnpm install
git add pnpm-lock.yaml package.json
git commit -m "chore: update lockfile"
```

### Fork 的 Actions 没有任何运行记录

确认 Fork 的 **Actions** 已启用，并且推送的是 `main` 分支或 `v*` 标签。

## 与上游同步

本 Fork 的本地克隆已添加 `upstream` 远程；如果在新机器上重新克隆，先添加：

```bash
git remote add upstream https://github.com/hisproc/transmission-next-ui.git
# 如果已存在，改用：git remote set-url upstream https://github.com/hisproc/transmission-next-ui.git
```

然后同步：

```bash
git fetch upstream --tags
git switch main
git merge upstream/main
```

或使用 rebase 保持线性历史：

```bash
git fetch upstream --tags
git switch main
git rebase upstream/main
```

同步时重点关注以下 **Fork 专属改动**，冲突时通常应保留本 Fork 的版本：

- `.github/workflows/build.yml`、`.github/workflows/release.yml`
- `download.sh` 中的 `REPO`
- `README.md`、`README_EN.md`、`doc/NasInstall.md` 中的仓库地址
- `src/lib/config.ts` 中的 `GITHUB_REPO`
- `package.json` 中的 `repository` / `homepage` / `bugs`

查看 Fork 相对上游的差异：

```bash
git log --oneline upstream/main..main
git diff upstream/main..main
```

## 向上游提交改动

`backup/main-before-release-ci` 保留了改造前的提交，可用于准备上游 PR：

```bash
# 查看可提交给上游的功能改动
git diff upstream/main..backup/main-before-release-ci

# 基于上游最新代码创建 PR 分支，并挑选功能提交
git switch -c feat/torrent-filters upstream/main
git cherry-pick 84f1c8d 244f43f
```

Release 工作流、仓库地址等属于本 Fork 的部署配置，通常不需要提交到上游。
