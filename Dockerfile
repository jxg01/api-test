# 第一阶段：构建Vue项目
FROM node:22 AS build
WORKDIR /app

# 设置npm镜像源，加速依赖安装
RUN npm config set registry https://registry.npmjs.org

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖（包括开发依赖）
RUN npm install --include=dev

COPY .env.production ./.env.production

# 复制项目文件（不包括node_modules和其他被忽略的文件）
COPY . .

# 构建生产版本
RUN npm run build

# 前端构建完毕后
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

# 第二阶段：使用Nginx提供静态文件
FROM nginx:1.28-alpine

# 复制构建产物到Nginx的静态文件目录
COPY --from=build /app/dist /usr/share/nginx/html

# 复制自定义Nginx配置文件
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
# COPY ./nginx.conf /etc/nginx/nginx.conf

# 暴露80端口
EXPOSE 80

# 启动Nginx服务
CMD ["nginx", "-g", "daemon off;"]