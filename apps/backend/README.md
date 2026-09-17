# Football Pitch Manager Backend

Backend NestJS chạy bằng Fastify.

## Chuẩn bị môi trường

Yêu cầu Node.js và pnpm. Tạo file `.env` từ `.env.example`, sau đó chỉnh các giá trị phù hợp môi trường local.

| Biến | Mặc định | Mô tả |
| --- | --- | --- |
| `NODE_ENV` | `development` | Chỉ nhận `development`, `test`, hoặc `production`. |
| `HOST` | `0.0.0.0` | Địa chỉ bind HTTP; local truy cập qua `localhost`. |
| `PORT` | `3000` | Cổng HTTP, từ 1 đến 65535. |
| `APP_NAME` | `football-pitch-manager` | Tên ứng dụng. |
| `API_PREFIX` | rỗng | Prefix toàn cục, ví dụ `api/v1`. |
| `CORS_ORIGIN` | rỗng | Dành cho task cấu hình CORS tiếp theo. |
| `LOG_LEVEL` | `log` | `fatal`, `error`, `warn`, `log`, `debug`, hoặc `verbose`. |

Cấu hình sai sẽ khiến ứng dụng dừng ngay khi bootstrap.

## Chạy ứng dụng

```bash
pnpm install
pnpm start:dev
```

Mặc định endpoint `GET /` chạy tại `http://localhost:3000/`.

## Kiểm tra

```bash
pnpm build
pnpm test
pnpm test:e2e
pnpm lint
```
