# Docker部署指南

本指南将帮助您将Vue项目部署到Linux服务器上使用Docker容器运行。

## 前提条件

在开始之前，请确保您的Linux服务器上已安装以下软件：
- Docker
- Docker Compose (可选)

## 1. 项目准备

### 环境变量配置

确保您的项目根目录中的`.env`文件包含正确的配置。当前项目中的关键环境变量包括：

```
# 后端API基础URL（取消注释并设置为您的后端服务地址）
# VITE_API_BASE_URL=http://your-backend-server/api

# Logo URL
VITE_LOGO_URL=https://img0.baidu.com/it/u=2731878684,99946995&fm=253&fmt=auto&app=138&f=JPEG?w=1422&h=800

# 文件服务基础URL（根据实际情况修改）
VITE_FILE_BASE_URL=http://your-file-server/media/
```

**重要提示**：在部署到生产环境前，请确保您正确配置了`VITE_API_BASE_URL`和`VITE_FILE_BASE_URL`环境变量，指向实际的后端服务和文件服务地址。

## 2. 本地构建和测试（可选但推荐）

在部署到服务器之前，建议先在本地进行构建和测试：

```bash
# 构建Docker镜像
docker build -t api-test:latest .

# 运行Docker容器进行测试
docker run -d -p 8080:80 --name api-test-container api-test:latest
```

然后在浏览器中访问 `http://localhost:8080` 检查应用是否正常运行。

## 3. 部署到Linux服务器

### 方法一：直接构建并运行

1. 将项目文件上传到Linux服务器（可使用`scp`、`rsync`或Git等方式）

2. 登录到Linux服务器，进入项目目录

3. 构建Docker镜像：
   ```bash
   docker build -t api-test:latest .
   ```

4. 运行Docker容器：
   ```bash
   docker run -d -p 80:80 --name api-test-container api-test:latest
   ```

   参数说明：
   - `-d`: 后台运行容器
   - `-p 80:80`: 将容器的80端口映射到主机的80端口
   - `--name api-test-container`: 给容器命名
   - `api-test:latest`: 使用的镜像名称和标签

### 方法二：使用Docker Compose（推荐）

1. 在项目根目录创建`docker-compose.yml`文件：

```yaml
version: '3'

services:
  api-test:
    build: .
    container_name: api-test-container
    ports:
      - "80:80"
    restart: unless-stopped
    # 如果需要，可以在这里添加环境变量
    # environment:
    #   - VITE_API_BASE_URL=http://your-backend-server/api
    #   - VITE_FILE_BASE_URL=http://your-file-server/media/
```

2. 运行Docker Compose：
   ```bash
   docker-compose up -d
   ```

## 4. 部署后检查

部署完成后，可以使用以下命令检查容器运行状态：

```bash
# 查看容器运行状态
docker ps

# 查看容器日志
docker logs api-test-container

# 进入容器（如需调试）
docker exec -it api-test-container /bin/sh
```

## 5. 后续维护

### 更新应用

当您需要更新应用时：

1. 将最新代码上传到服务器
2. 重新构建镜像并运行容器：
   ```bash
   # 对于直接运行方式
   docker stop api-test-container
   docker rm api-test-container
   docker build -t api-test:latest .
   docker run -d -p 80:80 --name api-test-container api-test:latest
   
   # 对于Docker Compose方式
   docker-compose down
   docker-compose up -d --build
   ```

### 清理无用资源

```bash
# 清理停止的容器
docker container prune

# 清理未使用的镜像
docker image prune -a
```

## 6. 高级配置（可选）

### 配置HTTPS

如果需要配置HTTPS，建议使用Nginx代理或Let's Encrypt证书。您可以在Docker Compose中添加一个Nginx服务来处理HTTPS请求。

### 持久化数据

如果您的应用需要持久化数据，可以使用Docker卷挂载：

```bash
# 在运行容器时添加卷挂载
docker run -d -p 80:80 --name api-test-container -v api-test-data:/app/data api-test:latest
```

或者在Docker Compose中配置卷：

```yaml
volumes:
  api-test-data:
```

然后在服务配置中添加：
```yaml
volumes:
  - api-test-data:/app/data
```

## 常见问题排查

1. **应用无法访问后端API**：检查`.env`文件中的`VITE_API_BASE_URL`是否正确配置，并确保后端服务可从容器内访问。

2. **容器启动失败**：查看容器日志了解具体错误原因：`docker logs api-test-container`

3. **端口冲突**：如果服务器上的80端口已被占用，可以修改端口映射，例如：`-p 8080:80`

4. **静态资源加载失败**：检查Nginx配置和文件路径是否正确。

如果您在部署过程中遇到任何问题，请参考Docker官方文档或联系技术支持。