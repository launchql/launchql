# UploadPostGraphilePlugin – Cursor AI 专属知识库

你正在阅读的是一个**生产级 PostGraphile 文件上传插件**，目标是：**让 PostGraphile 原生支持 GraphQL Upload 标量，并且做到“上传即存 URL，零手动解析”**。

### 核心能力（你必须知道）

1. **自动在所有 Create/Update 输入类型里添加 `xxxUpload: Upload` 字段**
   - 数据库列 `avatar_url` → 输入字段变成 `avatarUrlUpload: Upload`
   - 前端只传 File 对象，后端全部自动处理

2. **自动拦截所有 mutation，在执行前把 Upload Promise 解析并调用你的自定义 resolver**
   - 你只需要写一个异步函数：接收文件流 → 上传到 S3/本地/云存储 → 返回 URL
   - 插件会把返回的 URL 自动赋值给原来的字段（如 `avatarUrl`）

3. **完全透明**：你现有的 createUser / updateUser 等 mutation 代码一行不用改！

### 配置方式（两种，任选其一）

#### 推荐：Smart Comments（零代码，最优雅）

```sql
-- 在数据库列上加注释即可
comment on column users.avatar_url is
  E'@upload resolve:uploadAvatar\n@name avatarUrlUpload';

comment on column users.document_file is
  E'@upload resolve:uploadDocument';