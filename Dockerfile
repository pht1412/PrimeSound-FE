# GIAI ĐOẠN 1: BUILD MÃ NGUỒN (BUILD STAGE)
# Sử dụng Node để build ra các file tĩnh (HTML, CSS, JS)
FROM node:20-alpine AS build

# Tạo thư mục làm việc
WORKDIR /app

# Copy các file cấu hình thư viện trước
COPY package*.json ./

# Cài đặt toàn bộ thư viện cần thiết để build (bao gồm cả devDependencies)
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Build dự án React/Vite ra thư mục dist
RUN npm run build


# GIAI ĐOẠN 2: CHẠY (RUN STAGE)
# Sử dụng Nginx để phục vụ các file tĩnh đã build xong ở giai đoạn 1
FROM nginx:alpine

# Copy kết quả build từ giai đoạn 1 sang thư mục mặc định của Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Mở cổng 80 cho web
EXPOSE 80

# Chạy Nginx ở chế độ không nền (foreground) để container không bị dừng
CMD ["nginx", "-g", "daemon off;"]
