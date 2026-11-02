# shadcn-vue UI 重构计划

> 目标项目：`rengar-admin`（Vue 3.5、TypeScript、Vite、Vue Router、Pinia）
> 范围：仅替换 UI 层与 UI 库适配层；保持接口、业务规则、权限、路由行为和状态语义不变。
> 当前结论：Tailwind CSS v4 与 shadcn-vue 已在项目中配置；本次会把现存 UnoCSS 功能迁至 Tailwind CSS，并在迁移门禁通过后移除 UnoCSS。

## 1. 重构目标与决策

1. 将可见界面从 Naive UI 迁移到已安装的 shadcn-vue（Reka UI）组件、项目级 UI 组合组件和 Tailwind CSS。
2. 迁移完成后可移除 `naive-ui` 运行时依赖、Naive UI 自动导入/组件解析器、Provider、主题类型和构建专属配置。
3. API 模块、请求拦截器业务规则、Pinia 业务状态、路由/权限规则、请求参数和返回数据处理不因换 UI 而改写。
4. 只有 Naive UI 专属表单验证、树、通知确认、布局或其他 UI API 无法由现有应用接口承接时，才改相邻的页面/适配代码；每处改动都只转换交互边界，保留原业务动作和副作用。

### UnoCSS 与 Tailwind CSS 的决定

- **本次将 UnoCSS 完整迁至 Tailwind CSS，并移除 UnoCSS。** Tailwind v4 已运行，重构不需要另行初始化 Tailwind；但必须先迁移现存 UnoCSS 专属规则、快捷类、图标、主题变量和 reset，再删除其运行插件与依赖。
- 先独立完成样式引擎迁移并核对现有 Naive UI 界面视觉，再开始 shadcn-vue 组件替换。这样 Tailwind 覆盖、图标和颜色问题可以与页面组件行为分开排查。
- 本计划之后所有新增 UI 只使用 Tailwind CSS 与 shadcn-vue 组件，不再新增 UnoCSS 专属语法。

## 2. 当前项目基线

### 已有基础

- `components.json` 使用 `new-york`、Lucide、Tailwind CSS 变量和 `src/assets/styles/main.css`。
- 已有 Tailwind CSS v4、`@tailwindcss/vite`、`tw-animate-css`、Reka UI、Lucide Vue、`vue-sonner`、vee-validate、`@vee-validate/zod` 与 Zod。
- `src/components/ui/` 已安装成套 shadcn-vue 源码组件（含 Button、Card、Dialog、Sheet、Sidebar、Field、Form、Input、Select、Table、Tree 所需的 Collapsible/Checkbox 等基础项）。现有目录中有 Table，但没有项目级 DataTable 封装；当前树交互也没有现成的 shadcn-vue Tree 组件可直接替代。
- `uno.config.ts` 含 `presetWind3`、`presetIcons`、项目自定义 preset；`main.ts` 同时载入 UnoCSS reset、`virtual:uno.css` 与 Tailwind CSS。项目自定义 preset 提供 `flex-center` 等 shortcuts、primary 色预设和 `h-screen`/`w-screen` viewport 规则。

### 迁移影响面

静态扫描在 `src/` 中发现约 40 个含 Naive UI 组件、类型或运行时 API 的页面/应用文件（不含 shadcn UI 源码和文档页）。主要集中在：

| 范围 | 代表文件/功能 | 保持不变的行为 |
| --- | --- | --- |
| 全局装配与主题 | `src/components/AppProvider/index.vue`、`src/stores/modules/app.ts`、`src/utils/theme.ts`、`src/components/NCustomEle/index.vue` | 自动/亮/暗主题、主题色选择、主题过渡、灰度/色弱模式、站点设置状态 |
| 应用框架 | `src/layouts/base/strategies/*`、`src/layouts/components/*`、`src/layouts/components/common/*` | 四种布局（aside、top、top-aside、aside-double）、菜单权限/激活项、移动端菜单、标签页/右键菜单、面包屑、搜索、全屏、用户菜单、配置抽屉、水印 |
| 登录与反馈 | `src/views/login/index.vue`、`src/hooks/update.tsx`、`src/api/request.ts`、`src/router/guard.ts` | 验证码刷新、登录校验和跳转、成功/错误反馈、更新通知、路由加载反馈 |
| 管理页面 | `src/views/setting/user/**`、`role/**`、`permission/**`、`menu/**` | 查询分页、增删改、角色权限分配、菜单/按钮维护、表单校验、操作权限指令 |
| 示例页面 | `src/views/home/index.vue`、`src/views/404/index.vue`、`src/views/example/keep-alive/index.vue`、`src/views/docs/**` | 图表、待办本地持久化、错误页返回、KeepAlive 示例及仍保留的文档入口 |
| 构建与类型 | `build/plugins/auto-import.ts`、`build/plugins/index.ts`、`build/plugins/tailwindcss.ts`、`build/plugins/unocss.ts`、`typings/app/global.d.ts`、自动生成的类型声明、`vite.config.ts` | 保留仍需的 Vue/图标/Tailwind 插件；本次还会移除 UnoCSS 插件、配置和生成的样式入口 |

在 `src/components/ui/` 已有基础组件并不代表业务适配器已经完成：Naive UI 的远端分页表、任意层级树及半选联动、表单验证实例、确认框回调式 loading、全局路由加载条都需要专门验证。

## 3. 不可变的业务契约

开始每个页面前先记录页面当前行为，迁移后逐项对照。页面可以换 DOM、组件、样式和局部渲染器，不得顺手重构以下内容：

- `src/api/**` 的端点、HTTP 方法、参数/响应类型、请求和响应拦截策略、401 退出与重定向。
- 登录用户名/密码/验证码字段、验证码刷新时机、校验文案、登录 Action、`redirect` 处理和成功后路由。
- 用户/角色/菜单/权限的分页 `current`、`size`、总数处理，查询/保存/删除/密码修改请求，以及接口提交对象中的字段和值。
- 页面按钮权限码与 `v-role` 的位置/含义、路由 `meta.roles`、菜单过滤、标签和 KeepAlive 规则。
- 菜单树选择、当前节点取消选择、搜索保留无关节点、代码复制、菜单保存后刷新、删除确认，以及角色树父子全选/半选和提交叶子权限 ID 的规则。
- 角色绑定、多选 ID 格式、状态数值、密码确认、表单校验时机与提交失败后的保留/关闭行为。
- 用户配置的持久化结构、现有默认值和可调属性名称；主题模式切换、布局切换、主题色选择、色弱/灰度/水印等设置的状态含义。
- 首页待办的 localStorage 键/结构和完成逻辑、图表数据选项与图表库注册。

**允许的业务邻接改动：** 仅当原 UI API（如 `FormInst.validate()`、`NTree` 半选、`NDialog` loading）没有可直接复用的对应项时，为页面添加 shadcn/reka 事件映射、验证 schema、typed column definition 或确认服务调用。不得同时改 API、 store 结构或业务判断；把每次必要改动写入提交说明并对照上面的契约。

## 4. 组件替换规则

| Naive UI 能力 | 目标实现 | 迁移注意点 |
| --- | --- | --- |
| Button、Tag、Card、Divider、Alert、Empty、Spin | shadcn Button、Badge、Card、Separator、Alert、Empty、Spinner/Skeleton | 明确映射 `type`、`ghost`、`quaternary`、`text`、`loading`、尺寸和禁用态；loading 按钮保留禁用与加载图标 |
| Input、InputNumber、Checkbox、Radio、Switch | Input、NumberField 或受控数字输入、Checkbox、RadioGroup、Switch | 保留 Vue `v-model` 值类型，尤其是数值状态和 checkbox 布尔值；清空、密码显隐与键盘行为逐项核对 |
| Select | Select 或 Combobox；多选依实际需求采用可搜索组合 | 保留选项值类型、加载选项、清空和多选数组，不让 UI 把 ID 从 number 改成 string |
| Form、FormItem、FormInst、FormRules | shadcn Field/Form 组合 + vee-validate/Zod（已安装） | 保留字段名、规则、消息、校验触发时机、提交阻断和异步/交叉字段规则；验证失败不发请求 |
| Modal、Dialog、确认框 | Dialog、AlertDialog；带复杂表单时组合 Field/Dialog | 标题可访问性、Esc/遮罩关闭、确认中 loading、取消行为和成功后关闭均需等价 |
| Drawer | Sheet/Drawer | 检查左右位置、移动端宽度、焦点、关闭按钮、内容滚动与原设置抽屉/移动菜单行为 |
| NDataTable | shadcn Table + 本地 `AppDataTable` / `AppPagination` | 不假设 Table 自带排序/远端分页。当前列表以服务器分页为主；保留加载、空状态、横向滚动、行操作权限、页码与总量 |
| NTree | 本地递归 `AppTree` 组合（Collapsible、Checkbox、Button、Badge 等） | 两个使用场景分别支持菜单单选/搜索/复制后缀和权限树勾选/半选/祖先联动；避免将树选中算法与 API 写入通用 UI 组件 |
| NMenu、Layout、Sider | 现有布局外壳改为语义 HTML、Tailwind 与 shadcn Sidebar/NavigationMenu | 递归路由菜单、href 外链、激活菜单、折叠尺寸、反色、双栏固定/浮动子菜单和移动端 Sheet 必须逐个布局验证 |
| Dropdown、Tooltip、Popover、Breadcrumb | shadcn DropdownMenu、Tooltip、Popover、Breadcrumb | 右键标签页菜单、键盘可达性、导航与外链区别、关闭菜单后路由动作保持一致 |
| Message、Notification、Dialog Provider、LoadingBar Provider | `vue-sonner` + 项目级反馈/确认/路由加载适配器 | 保留既有调用点可用的成功、失败、提示、确认回调、异步 loading、更新提示按钮和路由开始/完成/失败语义 |
| Watermark、NGlobalStyle、NEl | 原生 CSS/SVG/Canvas 与 CSS 变量；逐项消除 Naive 变量依赖 | 保留水印内容、间距/重复、旋转、全屏与主题色；搜索 `--text-color-*`、`--body-color`、Naive component token |

## 5. 分阶段执行顺序

### 阶段 0：冻结基线与迁移清单

- [ ] 对照本计划记录当前页面截图/状态与可访问路径；测试环境允许时记录菜单、用户/角色、权限树的示例数据与分页状态。没有后端数据时将 API 不可用项登记为待浏览器联调，不伪造接口成功。
- [ ] 逐页面确认 `v-role` 权限码、表单规则、请求入口、关闭/刷新时机和路由目标。以 `src/views/setting/**` 现有处理函数为行为基线。
- [ ] 建立本次变更文件清单，确保 API、业务 store、路由 guard/权限算法没有非必要 diff。
- [ ] 记录 Tailwind 与 UnoCSS 共同生成时的页面样式和 token 基准，识别新的全局 CSS 覆盖前后差异。
- [ ] 搜索项目所有模板、JS/TS/TSX、CSS、路由元数据、`class` 动态拼接和生成声明中的 utility、`i-*` 图标、快捷类、颜色变量与 Uno 虚拟导入；特别记录未被普通文本扫描发现的动态 token。

**完成条件：** 每个迁移页面都有可核对的功能清单；后续不把业务改动混入组件替换。

### 阶段 1：统一 Tailwind 设计基础

- [ ] 检查 `src/assets/styles/main.css` 中 Tailwind v4 preflight、shadcn CSS 变量、`dark` variant、Inter 字体和 `tw-animate-css` 的加载顺序，为移除 UnoCSS reset 做准备。
- [ ] 建立并核对一套语义 token：background/foreground、card、popover、primary/primary-foreground、secondary、muted、accent、destructive、border、input、ring、sidebar、chart、radius。新组件只引用这些 token。
- [ ] 核对 `src/config/app.ts`、`src/stores/modules/app.ts`、`src/utils/theme.ts` 的 primary 色生成和 DOM 注入：颜色选择器改变主色时，shadcn 的语义 token、Tailwind 色阶变量、图表色及现存页面要保持同步。
- [ ] 保持用户主题模式、操作系统主题监听、View Transition、灰度/色弱和主题颜色配置的外部语义；将 Naive 专有的 `GlobalThemeOverrides`/`Layout` token 逐步替换为 CSS vars，而不是重命名用户配置字段。
- [ ] 确保表单错误、disabled、focus-visible、hover、深色背景、弹出层层级和滚动区域都使用 shadcn 对应状态。

**完成条件：** 现存主题控制能在 Tailwind 与 shadcn 样式下表达；颜色和暗色模式不依赖 Naive Provider 的隐藏变量。

### 阶段 2：把现有 UnoCSS 能力完整迁到 Tailwind 并退役 UnoCSS

这一阶段先保持 Naive UI 组件不变，独立验证 CSS 引擎迁移的视觉结果。Tailwind v4 已启用，所以主要工作是找齐 UnoCSS 独有输入并替换其生成职责。

- [ ] 盘点标准 utility 与 Tailwind v4 输出差异：检查静态类和动态类是否被 Tailwind 扫描到；替换无法解析的运行时拼接，必要时改为完整 class map 或显式 CSS。保留现有 DOM 与组件行为。
- [ ] 将 `@rengar-admin/unocss` 的 shortcuts 改成标准 Tailwind utility：`flex-center`、`flex-center-x`、`flex-center-y`、`flex-y`、`absolute-center-x/y`、`absolute-center`、`absolute-full`、`hidden-scrollbar`。完成全仓搜索，不能留下模板、JSX 或脚本构造的 shortcut 名。
- [ ] 迁移项目 preset 的 `h-screen`/`w-screen` 双 `vh/dvh`、`w-screen` 双 `vw/dvw`、`size-screen` 规则；明确使用 Tailwind v4 支持的 dvh/dvw utility 或等价 arbitrary value，核对浏览器安全区、移动地址栏和各布局高度。
- [ ] 将 `presetWind3` 当前输出与 Tailwind utility 对齐，重点核对自定义颜色 shade、任意值/变体、focus/hover、负值、响应式断点和 `dark:`。Tailwind 缺少的极少数 CSS 规则写成命名清晰的普通 CSS，不再写新 Uno preset。
- [ ] 把 preset 注入的 `--color-primary-*`、主题色阶生成和 `generateTailwindColorByColor()` 迁入项目 Tailwind/CSS token 初始化；保留 `src/config/app.ts` 默认色、动态主题选色、暗色主题文字对比、图表和既有颜色 class。清理 `packages/color` 中仅供 Uno preset 用的导出前先确认其他包未使用。
- [ ] 替换所有 `presetIcons`/`i-*`/`hover:i-*` 静态图标 utility。优先用已安装 Lucide 图标；保持现有 Iconify 图标含义时使用已安装的 `<SvgIcon icon="collection:name" />`。对 `SvgIcon.localIcon` 迁移本地图标解析方式，确保 `src/assets/svg-icons/logo.svg` 不再依赖 `i-local-*` CSS class。
- [ ] 搜索路由 `meta.icon`、`MenuIcon`、动态 `formatLocalIcon`、TSX render、icon safelist、`~icons/*` 导入及 `unplugin-icons`/`IconsResolver` 使用；保留动态 Iconify 和本地 logo。只有没有任何调用者时才移除 icon resolver、`unplugin-icons`、Iconify 工具包或图标声明。
- [ ] 比较 Tailwind Preflight 与 `@unocss/reset/tailwind-compat.css` 在 Naive UI 仍运行时的渲染；确认输入、按钮、列表、图片、默认字体、表格与滚动条没有回归后，再从 `src/main.ts` 删除 Uno reset 和 `virtual:uno.css`。
- [ ] **UnoCSS 卸载前门禁：** 全仓已无依赖 Uno 才生成的 shortcut、图标 class、颜色预设、virtual CSS 和动态 class 拼接；Tailwind-only 样式在 Uno 仍安装时完成类型检查、生产构建和旧 UI 视觉核对。
- [ ] 确认 CSS 类及图标全部由 Tailwind、普通 CSS 或 Vue 图标组件提供后，从 Vite plugin setup 删除 `setupUnocssPlugin()` 和 `build/plugins/unocss.ts`；移除 `uno.config.ts`、`@unocss/eslint-config/flat`、`@unocss/reset`、`unocss`、`@rengar-admin/unocss` 和无其他用途的 workspace 包/生成器。
- [ ] 搜索并更新 UnoCSS 文档路由、文档 iframe、README 和首页技术栈演示，改为 Tailwind CSS；清除已不适用的 `generateIconSafelist` 与 Uno 主题 helper。
- [ ] 在没有 Naive UI 组件替换的状态下核对全部现存页面：4 种布局、登录、菜单树、权限树、管理表格、首页、弹窗、移动端和动态主题。确保 Tailwind 单独提供样式后视觉和交互与迁移前一致。

**完成条件：** UnoCSS 依赖卸载后，无 `virtual:uno.css`、Uno reset/runtime plugin/config、Uno-only shortcut/icon class、Uno ESLint preset 或 Uno package/workspace 引用；再次跑类型检查和生产构建通过；旧 UI 页面在 Tailwind-only 状态通过回归。

### 阶段 3：反馈、对话框、表单验证适配层

- [ ] 在 `src/components/AppProvider/index.vue` 建立面向应用的服务装配边界。将 `window.$message` 的 success/error/warning/info 映射到 `vue-sonner`；确认方法集中实现并有明确成功、取消和失败结果。
- [ ] 把 `window.$dialog.warning` 的删除/退出确认迁到统一确认适配器（可用 AlertDialog 控制层）。覆盖用户删除、角色删除、菜单删除、按钮删除、退出登录；确认进行中的请求仍显示 loading，失败时保持对话框并允许重试，成功后才关闭并刷新列表/路由。
- [ ] 将 `src/hooks/update.tsx` 的 `useNotification` 与 NButton 改为 Sonner 或项目通知组件，保留更新说明、刷新动作、关闭行为和可访问操作按钮。
- [ ] 将 `src/router/guard.ts` 的 `start/finish/error` 替换为应用级轻量路由进度服务，保留触发条件和结束时机。
- [ ] 建立共用表单字段/错误展示约定，使用已安装 vee-validate/Zod；仅迁移 NForm 对应验证职责，保留各页面原始 `validate()` 后才能提交的控制流。优先单独迁移一个简单表单验证薄片确认 API。
- [ ] 完成后更新 `typings/app/global.d.ts`、生成的 auto-import 声明与调用方类型；在适配器完成前，页面不得直接依赖 Naive Provider 类型。

**完成条件：** 删除和退出仍需明确确认；异步失败不会误关闭；通知和加载条不依赖 Naive Provider；验证失败不触发业务请求。

### 阶段 4：先迁移布局与全局导航

按“共享控件 → 布局策略”的次序迁移，保留 `src/layouts/` 现有组件职责和 Pinia 读写：

- [ ] 全局共享控件：`AppHeader.vue`、`AppFooter.vue`、`AppBreadcrumb.vue`、`AppTabs.vue`、`AppSearchModal.vue`、`AppConfigDrawer.vue`、`AppMobieDrawer.vue`、`AppWaterMark.vue`。
- [ ] 菜单组件：`layouts/components/common/SysMenu.vue`、双栏布局的 `SysMenu.vue` / `SysSubMenu.vue`；递归渲染路由 meta 图标、菜单外链、激活值、折叠宽度、权限后可见菜单。
- [ ] 主题/设置控件：`AsideControl`、`GithubControl`、`MobieMenuControl`、`PasswordModal`、`ScreenControl`、`SearchControl`、`SettingControl`、`SysLogo`、`ThemeControl`、`UserCard`。保留快捷搜索、密码更新、登出、复制配置、重置配置等现有事件。
- [ ] 四种布局逐个替换 `NLayout*`：`asideLayout`、`topLayout`、`asideTopLayout`、`asideDoubleLayout`。先迁移单栏，再 top，再 aside-top，最后双栏（含 pin/float、外点关闭、重固定）；blank 布局不应被后台 shell 包裹。
- [ ] 尺寸响应式以已有 `isPc/isPad/isMobile` 和 `userConfig` 为准；不另起一套会改变断点语义的导航状态。
- [ ] 标签页的拖拽排序、右键关闭当前/其他/左/右/全部、固定标签、路由联动、滚动定位与 KeepAlive 不做算法重写。

**完成条件：** 四种桌面布局和移动端各自可用；路由菜单、标签、权限和布局切换的状态行为一致；双栏浮动/固定菜单可开关并恢复经典布局。

### 阶段 5：迁移登录和账号相关表单

- [ ] `src/views/login/index.vue`：替换 Card/Form/Input/Spin/Button，保留初始字段、验证码图片点击刷新、刷新清空验证码、rules 文案和触发时机、loading、`authLoginAction`、失败重新取验证码及原 redirect。
- [ ] 登录成功反馈走阶段 3 的服务，不把认证/路由跳转搬入 UI 组件。
- [ ] 迁移 `layouts/components/common/PasswordModal.vue`、用户密码 `views/setting/user/components/PasswordModal.vue` 和 user/role/menu/button 的新增编辑 Dialog。区分两类密码弹窗原本的接口、校验字段、成功后提示与关闭/重新登录效果。
- [ ] 迁移 `AddOrEditModal.vue`、`MenuAddModal.vue`、`ButtonAddModal.vue` 的表单规则与 select/radio/number 字段；利用 `after-enter/after-leave` 等价事件保持详情加载、模型重置和弹窗复开行为。
- [ ] 不因使用 vee-validate 而新增 API 层验证、修改提交对象或者统一原先不同的重置策略。

**完成条件：** 无效输入、密码不一致、缺少角色/验证码时阻止提交；成功、后端错误、取消、再次打开的行为与原页相同。

### 阶段 6：建立表格与列表页适配

- [ ] 在 `src/components/` 新建项目级 `AppDataTable` 与（必要时）`AppPagination`。底层先用已安装 shadcn Table 原语，不引入新表格库；只有明确需要 TanStack 功能时再单独评估依赖。
- [ ] 列定义使用精确 TypeScript 类型，支持字段列和 cell slot/render；操作列必须保留 `v-role` 权限码；状态展示用 Badge。loading、empty、宽度溢出、行操作间距需有统一样式。
- [ ] 远端分页只负责展示页面状态和 emit 页码/页容量；数据请求仍由原 view 发起。映射 Naive 的 `page/pageSize/itemCount/onChange` 时，保留当前实际支持的页容量和总数含义，不引入客户端二次分页。
- [ ] 迁移 `views/setting/user/index.vue`、`role/list/index.vue`、`permission/list/index.vue` 和 `menu/index.vue` 的按钮列表；保留现有 `columns` 数据意义、状态文字、动作顺序和错误处理。局部 render 函数只在 UI 无法通过 slot 表达时才薄改。
- [ ] 更新/新增后保持各页当前刷新策略和页码，尤其删除当前页最后一条数据时遵循现有后端分页约定，不擅自推导新请求行为。

**完成条件：** 用户/角色/权限的服务器分页、loading/empty、按钮权限与横向滚动可用；按钮列表无分页时仍正确显示。

### 阶段 7：迁移菜单维护和角色权限树

- [ ] 为 `src/views/setting/menu/index.vue` 的菜单选择树建立递归 `AppTree`：支持任意层级、选中/取消、过滤匹配、展开路径、保留无关节点显示、code/copy 后缀与点击冒泡隔离。只承接树 UI，不写 API/选中业务。
- [ ] 用 Grid/Flex + Card 实现菜单管理三栏在窄屏下折叠为一列；保留当前节点无选择提示、菜单编辑字段、按钮管理和三栏各自 loading。
- [ ] 用 shadcn Field/Button/Select/Table/DataTable 迁移菜单及按钮的编辑表单和表格；复制成功/失败使用统一反馈服务；按钮增删改后继续调用原刷新事件。
- [ ] 为 `src/views/setting/role/config/[id].vue` 的权限树实现 checkbox、父子联动、半选视觉和选择键列表。与现有 `extractLeafIds` 以及初始化/保存算法对照，默认不改该业务算法；如果控件只能提供原始勾选值差异，则只增加边界映射函数并用同一输入输出核对。
- [ ] 逐项核对权限初始化加载、保存按钮 loading、权限码 `v-role`、切换节点后显示的权限和保存 payload。

**完成条件：** 菜单 CRUD/复制/按钮维护和角色权限父子/半选/叶子 ID 行为一致；页面缩窄后仍能操作。

### 阶段 8：首页、错误页和示例/文档页

- [ ] `views/home/index.vue`：替换 Card、Grid、Checkbox、Modal、Input、Button 等；保留 ECharts 配置与注册、待办增删/完成/清理、本地存储 watcher、刷新提示和外链动作。不要把首页演示数据误接到业务 API。
- [ ] `views/404/index.vue`：替换按钮并核对 `router.back()` 和回首页行为。
- [ ] `views/example/keep-alive/index.vue`：替换示例按钮，确认页面名称、计数交互与 KeepAlive 标签演示仍正确。
- [ ] 盘点 `views/docs/naive-ui*`、`views/docs/unocss`、`src/router/routes.ts` 路由来源和首页技术栈列表。删除 Naive UI/UnoCSS 后不留“项目使用 Naive UI/UnoCSS”的误导入口：相关文档入口按项目文档策略移除或换成 shadcn-vue/Tailwind CSS 说明；只通过路由生成的源文件/约定改路线，不手工改自动生成的 route 类型/映射。
- [ ] 首页技术栈卡片和 `example/href` 等外链若仍写 Naive UI/UnoCSS，调整为 shadcn-vue/Tailwind CSS 或现存实际链接；这是模板说明 UI，不触及业务接口。

**完成条件：** 所有实际用户可访问路由都完成 Naive UI 替换；示例/文档与当前技术栈一致。

### 阶段 9：清除 Naive UI 全局运行时耦合（暂留依赖）

在所有页面和适配器完成后再进行：

- [ ] 移除 `AppProvider` 中 `NConfigProvider`、Message/Notification/Dialog/LoadingBar Provider、`NGlobalStyle` 与 `GlobalNaiveTool`；Provider 保留 App、路由、Pinia、Watermark 及新的 shadcn/Toaster/反馈服务。
- [ ] `src/stores/modules/app.ts` 删除 Naive 的 `useOsTheme`/`GlobalThemeOverrides` 依赖并改用浏览器或 VueUse 的系统主题状态；维持原主题 mode、颜色更新和 `setDetaultTheme` 对应效果。删除旧 `Layout` 颜色 override 后检查空白/卡片底色是否已由 CSS vars 承担。
- [ ] 对 `window.$message`、`window.$dialog`、`window.$notification`、`window.$loadingBar` 使用处逐一确认已落到项目级适配服务；API 请求层、router guard 和页面仍需可在全局 provider 初始化前安全调用。
- [ ] 删除/改造 `NCustomEle`，先用 `rg` 确认引用；如果没有使用则作为 Naive 依赖清理项移除，不能遗留 `--text-color-base` 或 `--body-color` 变量引用。
- [ ] 删除 `NaiveUiResolver` 和 AutoImport 中 Naive 函数；保留 `Components`、`IconsResolver` 或其他仍需插件。更新并检查 `typings/app/auto-imports.d.ts`、`components.d.ts`、`global.d.ts`；生成文件依项目流程生成，不能只删手写类型而不刷新声明。
- [ ] 删除 `vite.config.ts` 中 Naive 专属 rollup chunk group；检查 `build/plugins`、源码、脚本和声明里无 Naive 导入/类型。
- [ ] 此阶段先保留 `package.json` 与 lockfile 中的 `naive-ui`，等阶段 10 的交互回归和删除前门禁全部通过后再卸载。

**完成条件：** 源码、生成声明、打包配置和 UI 运行时均不再使用 Naive UI；暂时只在依赖清单中保留它，等待最终验收。

### 阶段 10：发布前验收与回归

#### 静态与构建门禁

- [ ] 依赖仍在 `package.json` 时，先跑 `pnpm type-check`、`pnpm build`；记录并区分迁移错误与仓库原有错误，不能以“此前就有”替代本次差异审查。
- [ ] 卸载前 `rg` 检查 `src`、`build`、`typings` 与构建配置：没有 Naive 导入/类型/解析器/provider/`N*` 组件或运行 API；没有 `virtual:uno.css`、`@unocss`、Uno plugin/config、Uno shortcut 或只由 Uno 生成的图标类。

#### 交互回归矩阵

- [ ] 认证：登录必填校验、验证码初次/点击刷新、失败重试、成功 toast、redirect；退出确认、密码修改两类弹窗。
- [ ] 导航：四种布局切换、折叠/展开、桌面和移动端、菜单权限过滤/激活/外链、搜索历史增删清空、面包屑、全屏。
- [ ] 标签：打开/切换/刷新、拖拽、右键五种关闭动作、固定标签、KeepAlive 计数和动态路由参数隔离。
- [ ] 设置：亮/暗/自动跟随系统、主色即时更改、动画选项、宽度/高度配置、反色、灰度、色弱、水印、复制配置与重置。
- [ ] 列表：用户/角色/权限查询、服务端翻页、动作列权限、创建/编辑/删除确认、加载/空态、失败后状态保留。
- [ ] 菜单与角色：树搜索/选择/取消、复制 code、菜单/按钮增删改、表单错误、角色树全选/半选/取消、最终权限 ID 与原算法结果一致。
- [ ] 首页/其他：待办增删和完成、刷新/空输入提示、localStorage 重载、图表显示、404 返回及回首页、更新通知刷新动作。
- [ ] 逐种 layout 做至少一次可视尺寸检查；桌面宽屏、平板和手机宽度重点查看溢出、弹层滚动、焦点和表格横向滚动。
- [ ] 上述功能与视觉回归都通过后，执行第 7 节删除前门禁；从 `package.json` 移除 `naive-ui`，用 pnpm 更新 lockfile，再跑 `pnpm why naive-ui`、`pnpm type-check`、`pnpm build` 和依赖树/静态搜索确认。

**完成条件：** UnoCSS 和 Naive UI 均已移除；静态检查、依赖图、类型检查、生产构建、权限角色差异核对及交互矩阵均有结果记录。

## 6. 每个迁移切片的工作纪律

建议按小切片提交，避免一个大 PR 同时改变 layout、validation、theme 和 API 调用：

1. 每个切片先选一个共享组件或一个页面，写出原行为 → 新组件映射。
2. 先用已安装 shadcn-vue 组件；仅当组件原语不能表达现有行为时才加项目级组合组件。
3. `src/components/ui/` 是生成/上游组件区，尽量不改其基础组件源码；页面特定视觉放在业务组合组件或调用处。
4. 保留现有 Vue 3 Composition API、TypeScript 和页面职责；不要将 API 请求、表单业务判断移入通用 UI 组件。
5. 一个页面完成后核对本计划中的行为契约，再开始下一页面；发现原有行为不明时先记录差异，不推测新业务规则。
6. 每次新增/替换 UI 后跑类型检查/构建并做对应手动交互核对；本计划只定义将来的执行门禁，本次计划编写不改应用文件。

## 7. 最终 Naive UI 移除检查表

**删除依赖前门禁：** 以下各项全部打勾后，才从依赖清单移除 `naive-ui`：

- [ ] 全部用户路由和会运行的 JSX/TSX hook 已替换 Naive UI 组件。
- [ ] 没有 Naive 类型：`FormInst`、`FormRules`、`DataTableColumns`、`TreeOption`、`TreeInst`、`MenuOption`、`DropdownOption`、`GlobalThemeOverrides`、Provider 实例类型等。
- [ ] 没有 Naive 自动导入、组件 resolver、全局 provider、NGlobalStyle、Naive token CSS 和 Naive 专属 bundle 分组。
- [ ] 全局消息、确认、通知、loading bar 与主题系统均由项目自己的实现提供；路由 guard/API 错误处理可安全使用。
- [ ] 阶段 2 的 Tailwind-only CSS 迁移已经完成；无 UnoCSS 运行依赖、配置、虚拟样式导入、专属快捷类或图标类。
- [ ] 生成声明已刷新；Naive UI 仍安装时的 `pnpm type-check` 与生产构建通过。
- [ ] 完成阶段 10 的交互回归矩阵；业务接口、提交 payload、权限码和路由目标抽查均无差异。

**删除依赖后门禁：** pnpm lockfile 更新完成；`pnpm why naive-ui` 符合预期；再跑一次 `pnpm type-check` 和生产构建并记录结果。全部通过才算完成卸载。

## 8. 明确不在范围内

- 不改后端接口、API 文件、认证/权限算法、Pinia 业务 store 的数据结构、路由定义语义或业务文案规则。
- 不在此次迁移中重写 ECharts、Axios、Vue Router、权限指令、持久化或 KeepAlive 实现。
- 不以“统一代码风格”为由批量改写页面状态逻辑，也不因新组件 API 不同而改变原交互。
- 本次包含 UnoCSS → Tailwind CSS 迁移；不在此之外重写后端接口、业务规则或其他无关技术栈。
