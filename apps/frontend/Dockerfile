# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Frontend KHÔNG CÓ pnpm-workspace.yaml nên chỉ copy 2 file này
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build


# --- Stage 2: Serve với Nginx ---
FROM nginx:alpine AS runner

# Xóa trang mặc định của Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy sản phẩm build tĩnh sang Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]