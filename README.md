# MoodVerse

MoodVerse 是一个以“情绪可视化 + 数据驱动分析”为核心的沉浸式 Web 应用。  
项目通过 3D 星球、动态星轨与个性化仪表盘，将用户的心情记录转化为可持续追踪的情绪画像。

---

## 项目定位

- 面向情绪记录与自我观察场景
- 支持账号登录、数据隔离、持久化存储
- 提供“记录 → 分析 → 展示”的完整闭环
- UI 风格为科幻暗色 + 星系视觉体系

---

## 核心功能

### 1) 账号与会话系统

- 邮箱 + 密码注册 / 登录
- JWT Cookie 鉴权（`mv_token`）
- 未登录访问受保护页面自动重定向到 `/login`
- 登录后访问登录页自动跳转到 `/`
- 支持退出登录、注销账户

### 2) 心情记录（`/mood/new`）

- 选择心情类型（喜悦 / 冷静 / 活力 / 沉思）
- 记录多维指标：
	- 心率 `heartRate`
	- 睡眠 `sleep`
	- 能量 `energy`
	- 稳定性 `stability`
- 支持备注 `note` 与触发标签 `tags`
- 记录提交后写入后端持久化存储

### 3) 心情星球分析（`/mood`）

- 首卡使用 Three.js 动态星球渲染
- 按最新记录自动切换星球主题色与情绪文案
- 趋势分析 / 触发点 / 呼吸影响均来自后端算法实时计算

### 4) 仪表盘首页（`/`）

- 首页主星球基于最新数据动态展示
- 轨道漂移、平均心率、睡眠周期、活跃能量、稳定性等指标实时计算
- 所有统计数据来源于当前登录账号的心情记录

### 5) 设置页（`/settings`）

- 视觉参数调节（滑块）
- 偏好操作（冥想模式、定时唤醒）
- 隐私安全：
	- 清除个人数据（清空当前邮箱所有心情记录）
	- 退出登录
	- 注销账户

---

## 技术栈

### 前端

- **Next.js 16**（App Router）
- **React 19** + **TypeScript**
- **Tailwind CSS v4**（项目中以全局自定义 CSS 为主）
- **Framer Motion**（交互动效）
- **Lucide React**（图标）
- **react-range**（自定义滑块）

### 3D 渲染

- **three**
- **@react-three/fiber**
- **@react-three/drei**

### 服务端与安全

- Next.js Route Handlers（`app/api/**`）
- **jose**（JWT 签发与校验）
- Cookie 鉴权（HttpOnly）

### 数据存储

- 本地 JSON 文件持久化（无外部数据库）
- Node 文件系统读写 + 原子写入策略

---

## 项目结构（关键目录）

```text
app/
	api/
		login/route.ts        # 登录/注册
		logout/route.ts       # 退出登录
		account/route.ts      # 注销账户
		mood/route.ts         # 心情记录查询/新增/清除
	components/
		app-shell.tsx         # 页面骨架
		dashboard-sections.tsx
		mood-planet.tsx
		planet-core.tsx       # Three.js 星球核心组件
	lib/
		auth-session.ts       # 从 Cookie 解析当前登录邮箱
		persistence.ts        # 可写目录解析 + JSON 原子写入
		accounts-store.ts     # 账户存储
		mood-records.ts       # 心情记录存储（按邮箱隔离）
		mood-analytics.ts     # 算法分析
		mood-meta.ts          # 情绪颜色与文案映射
	mood/
		page.tsx              # 心情分析页面
		new/page.tsx          # 心情录入页面
	settings/page.tsx       # 系统配置页面
	page.tsx                # 仪表盘首页
middleware.ts             # 路由鉴权守卫
```

---

## 数据模型说明

### 账户数据 `accounts.json`

```ts
type Account = {
	email: string;
	passwordHash: string;
	createdAt: string;
}
```

### 心情数据 `mood-records.json`（按邮箱隔离）

```ts
type MoodRecord = {
	id: string;
	mood: "joy" | "calm" | "focus" | "sad";
	heartRate: number;
	sleep: number;
	energy: number;
	stability: number;
	note: string;
	tags: string[];
	createdAt: string;
}

type MoodRecordsByUser = Record<string, MoodRecord[]>
```

---

## 分析算法概览

分析由 `app/lib/mood-analytics.ts` 统一计算，主要包括：

- 趋势收敛率（波动时序变化）
- 触发点贡献占比（标签加权）
- 呼吸影响（慢呼吸分组对稳定性的影响）
- 仪表盘统计（对齐指数、清醒脉冲、时间稳定性、平均指标）

> 所有计算结果都基于当前登录邮箱的心情历史数据。

---

## API 概览

### Auth

- `POST /api/login`：登录 / 注册
- `POST /api/logout`：退出登录
- `DELETE /api/account`：注销账户

### Mood

- `GET /api/mood`：获取当前用户心情记录摘要 + 分析结果
- `POST /api/mood`：新增一条心情记录
- `DELETE /api/mood`：清空当前用户全部心情记录（用于“清除个人数据”）

---

## 接口请求示例

以下示例使用 `JSON`，并默认你已在浏览器中拥有登录态 Cookie（`mv_token`）。

### 1) 登录 / 注册

`POST /api/login`

请求体（登录）：

```json
{
	"email": "demo@example.com",
	"password": "123456",
	"action": "login"
}
```

请求体（注册）：

```json
{
	"email": "demo@example.com",
	"password": "123456",
	"action": "create"
}
```

成功响应：

```json
{
	"success": true,
	"action": "login"
}
```

或

```json
{
	"success": true,
	"action": "create"
}
```

失败响应示例：

```json
{
	"success": false,
	"message": "登录失败，邮箱或密码错误"
}
```

### 2) 获取当前用户心情摘要与分析

`GET /api/mood`

成功响应示例：

```json
{
	"success": true,
	"count": 12,
	"latest": {
		"mood": "joy",
		"heartRate": 72,
		"sleep": 78,
		"energy": 84,
		"stability": 94,
		"createdAt": "2026-03-31T08:00:00.000Z"
	},
	"analytics": {
		"trendConvergence": 13,
		"triggerTag": "工作",
		"triggerContribution": 56,
		"breathingHabitRate": 42,
		"breathingImpact": 19,
		"bars": [62, 70, 66, 73, 75, 80, 78]
	},
	"dashboard": {
		"mood": "joy",
		"alignmentScore": 94,
		"companionMoods": ["calm", "focus"],
		"awakePulseDelta": 12.4,
		"timeStability": 82,
		"avgHeartRate": 74,
		"avgSleepHours": 7.6,
		"avgEnergyKcal": 2296,
		"avgStability": 88
	}
}
```

未登录响应示例：

```json
{
	"success": false,
	"message": "未登录"
}
```

### 3) 新增心情记录

`POST /api/mood`

请求体示例：

```json
{
	"mood": "joy",
	"heartRate": 72,
	"sleep": 78,
	"energy": 84,
	"stability": 94,
	"note": "今天完成了一个重要里程碑",
	"tags": ["工作", "关系"]
}
```

成功响应示例：

```json
{
	"success": true,
	"count": 13,
	"message": "记录成功"
}
```

失败响应示例：

```json
{
	"success": false,
	"message": "心率范围无效"
}
```

### 4) 清除当前用户全部心情数据

`DELETE /api/mood`

成功响应示例：

```json
{
	"success": true,
	"removedCount": 13,
	"message": "个人心情数据已清除"
}
```

### 5) 退出登录

`POST /api/logout`

成功响应示例：

```json
{
	"success": true
}
```

### 6) 注销账户

`DELETE /api/account`

成功响应示例：

```json
{
	"success": true
}
```

---

## 本地开发

### 1) 安装依赖

```bash
npm install
```

### 2) 启动开发环境

```bash
npm run dev
```

默认访问：`http://localhost:3000`

---

## 环境变量

建议至少配置以下变量：

```bash
AUTH_SECRET=your-strong-random-secret
MV_DATA_DIR=/absolute/path/to/persistent/data
```

说明：

- `AUTH_SECRET`：JWT 签名密钥，生产环境必须配置强随机值
- `MV_DATA_DIR`：持久化数据目录（强烈建议在生产环境配置）

---

## 持久化与部署说明（重点）

MoodVerse 使用 JSON 文件存储。为了保证**重启不丢数据**：

1. 将 `MV_DATA_DIR` 指向持久化磁盘/挂载卷
2. 确保运行用户对该目录有读写权限

示例建议：

- Linux 服务器：`/var/lib/moodverse`
- Docker：挂载 volume 到容器并将 `MV_DATA_DIR` 指向挂载目录

若未配置 `MV_DATA_DIR`，系统会尝试 fallback 目录（开发可用，生产不建议）。

---

## 脚本命令

```bash
npm run dev      # 开发模式
npm run build    # 生产构建
npm run start    # 生产启动
npm run lint     # ESLint 检查
```

---

## 路由说明

- 根路径固定为：`/`
- 登录页：`/login`
- 心情页：`/mood`
- 心情记录页：`/mood/new`
- 设置页：`/settings`

---

## 设计与交互特性

- 科幻暗色视觉体系
- 3D 情绪星球（动态主题色）
- 星轨与粒子动态效果
- 模态确认框、Toast 提示、跨页状态同步

---

## 许可

当前仓库未单独声明开源许可证，请按项目所有者策略使用。
