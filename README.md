# 🤖 Agent Factory Smallville

**AI Agent 可视化监控平台** - 基于Stanford Smallville论文的多智能体仿真系统

🔗 **在线演示**: [https://tommyyula.github.io/agent-factory-smallville/](https://tommyyula.github.io/agent-factory-smallville/)

![Agent Factory Screenshot](https://via.placeholder.com/800x400?text=Agent+Factory+Smallville+Dashboard)

## 🌟 特性亮点

### 🎮 完全程序化生成
- **零外部依赖** - 所有像素风美术资源通过Phaser Graphics API生成
- **动态建筑物** - 仓库、办公室、数据中心等7种建筑类型
- **8种代理类型** - 每种都有独特的外观和行为模式
- **动画系统** - 行走、工作、思考等多种动画状态

### 🧠 智能行为仿真  
- **状态机驱动** - `idle → thinking → executing → communicating` 循环
- **记忆系统** - 基于Smallville论文的观察、反思、计划三层记忆
- **任务分配** - 智能匹配代理能力与任务需求
- **自主交流** - 代理间会主动协调工作

### 🏗️ ITEM公司场景
专为物流科技公司定制的8个角色：

| 代理类型 | 颜色 | 职责 | 技能 |
|---------|------|------|------|
| 🔴 仓储管家 | 红色 | 库存管理监督 | 库存盘点、质量控制 |
| 🔵 运输调度 | 蓝色 | 物流运输优化 | 路线规划、调度协调 |  
| 🟢 客服代表 | 绿色 | 客户服务支持 | 问题解决、沟通技巧 |
| 🟠 数据分析师 | 橙色 | 运营数据分析 | 数据挖掘、报表生成 |
| 🟣 开发工程师 | 紫色 | 系统开发维护 | 编程开发、代码审查 |
| 🟡 质检专员 | 黄色 | 质量保证控制 | 质量检验、合规审核 |
| 🩷 规划师 | 洋红 | 战略规划分析 | 需求预测、容量规划 |
| 🩵 协调员 | 青色 | 跨团队协调 | 团队领导、冲突解决 |

### 💻 现代技术栈
- **前端**: React 18 + TypeScript + Phaser 3 + Zustand  
- **后端**: Node.js + Express + WebSocket + TypeScript
- **架构**: Monorepo + npm workspaces
- **状态管理**: Zustand + 实时WebSocket同步
- **部署**: GitHub Pages + 内嵌Mock模式

## 🚀 快速开始

### 在线体验
直接访问 [在线演示](https://tommyyula.github.io/agent-factory-smallville/) 即可体验完整功能！

### 本地运行

```bash
# 克隆项目
git clone https://github.com/tommyyula/agent-factory-smallville.git
cd agent-factory-smallville

# 安装依赖
npm install

# 方式1: 仅前端 (Mock模式)
cd packages/client
npm run dev
# 访问 http://localhost:5173

# 方式2: 完整系统 (前端+后端)
# 终端1: 启动后端
cd packages/server
npm run dev

# 终端2: 启动前端  
cd packages/client
npm run dev
```

## 🎮 使用说明

### 游戏控制
- **方向键** - 移动视角
- **鼠标滚轮** - 缩放地图
- **点击代理** - 查看详细信息
- **侧边栏** - 切换不同面板

### 面板功能
- **代理面板** - 查看所有代理状态和指标
- **任务面板** - 监控任务队列和进度
- **消息面板** - 实时代理通信日志
- **统计面板** - 系统整体运行数据

### 可视化元素
- **💭 思维气泡** - 代理当前思考内容
- **📞 通信线** - 代理间交流连接
- **🟦 状态指示器** - 实时状态显示
- **📊 进度条** - 任务执行进度

## 🏗️ 架构设计

```
agent-factory-smallville/
├── packages/
│   ├── shared/          # 共享类型定义
│   │   └── src/types.ts # Agent, Task, Message等接口
│   ├── server/          # 后端服务 
│   │   ├── src/
│   │   │   ├── models/      # 数据模型
│   │   │   ├── services/    # 业务逻辑
│   │   │   ├── routes/      # REST API
│   │   │   ├── websocket/   # WebSocket服务
│   │   │   ├── runtime/     # 代理运行时
│   │   │   └── mock/        # 模拟数据
│   │   └── package.json
│   └── client/          # 前端应用
│       ├── src/
│       │   ├── game/        # Phaser游戏引擎
│       │   │   ├── graphics/    # 程序化美术生成
│       │   │   └── scenes/      # 游戏场景
│       │   ├── components/  # React组件
│       │   ├── store/       # Zustand状态管理
│       │   └── services/    # WebSocket客户端
│       └── package.json
├── deploy.js            # GitHub Pages部署脚本
└── package.json         # 根工作空间配置
```

## 🔧 API接口

### REST API
```
GET  /api/agents          # 获取代理列表
GET  /api/agents/:id      # 获取代理详情  
POST /api/agents          # 创建代理
PUT  /api/agents/:id/status # 更新代理状态

GET  /api/tasks           # 获取任务列表
POST /api/tasks           # 创建任务
PUT  /api/tasks/:id/assign # 分配任务

GET  /api/scene/config    # 获取场景配置
GET  /api/system/stats    # 获取系统统计
```

### WebSocket事件
```
agent:status      # 代理状态变化
agent:move        # 代理移动
agent:thought     # 代理思考
task:update       # 任务更新  
message:new       # 新消息
system:status     # 系统状态
```

## 🎨 程序化美术

所有视觉资源都通过Phaser Graphics API程序生成：

### 地图瓦片
- 🌱 **草地** - 带纹理变化的绿色基础瓦片
- 🛤️ **小径** - 浅棕色碎石路径
- 🛣️ **道路** - 深灰色主干道，带白色标线  
- 💧 **水面** - 蓝色水域，带光影效果

### 建筑物
- 🏭 **仓库** (128x96) - 棕色主体，红色屋顶，装卸台
- 🏢 **办公室** (96x80) - 灰色现代建筑，网格窗户
- 💾 **数据中心** (128x128) - 深蓝主体，绿色服务器指示灯
- 🏠 **宿舍** (64x64) - 米色小屋，红色屋顶
- 🚛 **运输枢纽** (128x96) - 绿色建筑，多个装卸台  
- 🤝 **会议室** (80x64) - 浅蓝内室，桌椅布局

### 代理精灵
- **52帧动画** - 13种动作 × 4帧循环
- **动作类型** - 空闲、行走(4方向)、工作、思考、交流
- **颜色编码** - 8种类型对应不同颜色
- **状态指示器** - 圆形彩色状态点

## 📊 性能指标

### 代理指标
- **任务完成数** - 历史完成任务统计
- **平均耗时** - 任务执行时长分析
- **通信活跃度** - 发送/接收消息数量
- **在线时长** - 活跃/空闲/错误时间分布

### 系统指标  
- **总代理数** - 系统中代理总数
- **活跃代理** - 当前非空闲状态代理数
- **任务吞吐** - 单位时间完成任务数
- **系统健康** - 综合运行状态评分

## 🚀 部署指南

### GitHub Pages部署
```bash
# 一键部署
node deploy.js

# 或手动构建
npm run build:all
npx gh-pages -d packages/client/dist --dotfiles
```

### 自托管部署
```bash
# Docker部署 (可选)
docker build -t agent-factory .
docker run -p 3001:3001 -p 5173:5173 agent-factory

# PM2部署
pm2 start packages/server/dist/index.js --name agent-server
pm2 start "npm run preview" --cwd packages/client --name agent-client
```

## 🤝 参与贡献

1. **Fork项目** 并克隆到本地
2. **创建功能分支** `git checkout -b feature/amazing-feature`
3. **提交更改** `git commit -m 'Add amazing feature'`
4. **推送分支** `git push origin feature/amazing-feature`  
5. **创建Pull Request**

### 贡献指南
- 📝 使用中英双语注释
- 🎯 遵循现有代码风格
- ✅ 确保TypeScript类型安全
- 🧪 添加适当的错误处理

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

- **Stanford Smallville** - 多智能体行为仿真理论基础
- **Phaser 3** - 强大的HTML5游戏引擎
- **React生态** - 现代前端开发框架
- **ITEM公司** - 真实业务场景参考

---

<div align="center">
  
**🤖 Agent Factory Smallville** - 让AI代理行为可视化！

[🔗 在线体验](https://tommyyula.github.io/agent-factory-smallville/) • 
[📖 文档](https://github.com/tommyyula/agent-factory-smallville/wiki) • 
[🐛 报告问题](https://github.com/tommyyula/agent-factory-smallville/issues) • 
[💬 讨论](https://github.com/tommyyula/agent-factory-smallville/discussions)

</div>