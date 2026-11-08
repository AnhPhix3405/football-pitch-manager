# Tài Liệu API Hệ Thống Football Pitch Manager

Tài liệu chi tiết toàn bộ các API HTTP REST và WebSocket Gateway của hệ thống Football Pitch Manager, được phân loại theo từng nhóm chức năng thực tế trong backend.

---

## 1. Quy Chuẩn Chung

- **Base URL Backend:** `http://localhost:3000` (Không có prefix toàn cục theo cấu hình `app.config.ts`).
- **Định dạng dữ liệu:** `application/json; charset=utf-8`.
- **Cơ chế xác thực (Authentication):**
  - **Access Token:** Gửi qua header `Authorization: Bearer <accessToken>`.
  - **Refresh Token:** Lưu trong `httpOnly` cookie (`refreshToken`) hoặc gửi trực tiếp trong request body.
- **Header đa ngôn ngữ:** Hỗ trợ `Accept-Language: vi` hoặc `Accept-Language: en`.

---

## 2. Bảng Tổng Hợp Danh Sách Endpoint

| Nhóm chức năng | Phương thức | Đường dẫn API | Quyền truy cập | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **Xác thực** | `POST` | `/auth/register` | Public | Đăng ký tài khoản người dùng mới |
| | `POST` | `/auth/login` | Public | Đăng nhập bằng email và mật khẩu |
| | `POST` | `/auth/google` | Public | Đăng nhập bằng Google ID Token |
| | `POST` | `/auth/refresh` | Public / Token | Làm mới cặp token truy cập |
| | `POST` | `/auth/logout` | Đã đăng nhập | Đăng xuất và vô hiệu hóa session |
| | `GET` | `/auth/test/*` | Dev / Test | Bộ API kiểm thử guard phân quyền |
| **Quản lý sân bóng** | `GET` | `/fields` | Public | Lấy danh sách sân bóng công khai có phân trang/lọc |
| | `GET` | `/fields/:id` | Public | Lấy thông tin chi tiết một cụm sân bóng |
| | `POST` | `/owner/fields` | Owner / Admin | Chủ sân tạo mới cụm sân bóng |
| | `GET` | `/owner/fields` | Owner / Admin | Chủ sân lấy danh sách cụm sân thuộc quyền sở hữu |
| | `GET` | `/owner/fields/:id` | Owner / Admin | Chủ sân xem chi tiết cụm sân của mình |
| | `PATCH` | `/owner/fields/:id` | Owner / Admin | Chủ sân cập nhật thông tin cụm sân |
| | `DELETE` | `/owner/fields/:id` | Owner / Admin | Chủ sân vô hiệu hóa (tắt hoạt động) cụm sân |
| | `POST` | `/owner/fields/:fieldId/courts` | Owner / Admin | Tạo sân con mới (loại 5/7/11) |
| | `GET` | `/owner/fields/:fieldId/courts` | Owner / Admin | Lấy danh sách sân con thuộc cụm sân |
| | `GET` | `/owner/fields/:fieldId/courts/:courtId` | Owner / Admin | Xem chi tiết thông tin một sân con |
| | `PATCH` | `/owner/fields/:fieldId/courts/:courtId` | Owner / Admin | Cập nhật thông tin sân con |
| | `DELETE` | `/owner/fields/:fieldId/courts/:courtId` | Owner / Admin | Vô hiệu hóa (inactive) sân con |
| | `POST` | `/owner/fields/:fieldId/images` | Owner / Admin | Thêm hình ảnh mới cho cụm sân |
| | `GET` | `/owner/fields/:fieldId/images` | Owner / Admin | Lấy danh sách hình ảnh theo thứ tự hiển thị |
| | `PATCH` | `/owner/fields/:fieldId/images/:imageId` | Owner / Admin | Cập nhật thứ tự hoặc đặt làm thumbnail |
| | `DELETE` | `/owner/fields/:fieldId/images/:imageId` | Owner / Admin | Xóa hình ảnh khỏi cụm sân |
| | `POST` | `/owner/fields/:fieldId/services` | Owner / Admin | Tạo dịch vụ đi kèm mới cho cụm sân |
| | `GET` | `/owner/fields/:fieldId/services` | Owner / Admin | Lấy danh sách dịch vụ đi kèm |
| | `PATCH` | `/owner/fields/:fieldId/services/:serviceId` | Owner / Admin | Cập nhật thông tin dịch vụ đi kèm |
| | `DELETE` | `/owner/fields/:fieldId/services/:serviceId` | Owner / Admin | Tắt trạng thái hoạt động của dịch vụ |
| | `PUT` | `/owner/fields/:fieldId/opening-hours` | Owner / Admin | Cấu hình tuần hoàn giờ mở cửa 7 ngày |
| | `GET` | `/owner/fields/:fieldId/opening-hours` | Owner / Admin | Xem cấu hình giờ mở cửa theo tuần |
| | `POST` | `/owner/fields/:fieldId/courts/:courtId/blocked-slots` | Owner / Admin | Khóa khoảng giờ sân con chống chồng chéo |
| | `GET` | `/owner/fields/:fieldId/courts/:courtId/blocked-slots` | Owner / Admin | Xem danh sách khoảng giờ bị khóa của sân con |
| | `DELETE` | `/owner/fields/:fieldId/courts/:courtId/blocked-slots/:slotId` | Owner / Admin | Mở khóa (xóa) khoảng giờ bị khóa |
| | `POST` | `/owner/fields/:fieldId/pricing` | Owner / Admin | Cấu hình bảng giá theo khung giờ và loại sân |
| | `GET` | `/owner/fields/:fieldId/pricing` | Owner / Admin | Lấy danh sách bảng giá cấu hình của cụm sân |
| | `PATCH` | `/owner/fields/:fieldId/pricing/:pricingId` | Owner / Admin | Cập nhật khung giá sân |
| | `DELETE` | `/owner/fields/:fieldId/pricing/:pricingId` | Owner / Admin | Xóa khung giá cấu hình |
| | `GET` | `/fields/:fieldId/pricing/quote` | Public | Tính toán báo giá tức thời theo loại sân, ngày giờ |
| | `GET` | `/fields/:fieldId/availability` | Public | Kiểm tra tình trạng trống của các sân con theo khung giờ |
| | `GET` | `/owner/fields/:fieldId/courts/timeline` | Owner / Admin | Xem timeline trực quan tình trạng đặt/khóa theo ngày |
| | `GET` | `/owner/fields/:fieldId/courts/:courtId/check-assignment` | Owner / Admin | Kiểm tra tính hợp lệ khi gán sân con cho đơn đặt |
| **Quản lý Đặt Sân & Vòng Đời** | `POST` | `/bookings` | User / Active | Tạo yêu cầu đặt sân (kèm dịch vụ & snapshot giá) |
| | `GET` | `/bookings/me` | User / Active | Xem danh sách đơn đặt sân của cá nhân |
| | `GET` | `/bookings/:id` | User / Active | Xem chi tiết đơn đặt sân kèm lịch sử trạng thái |
| | `POST` | `/bookings/:id/cancel` | User / Active | Người đặt hủy đơn sân đang chờ hoặc đã xác nhận |
| | `GET` | `/owner/fields/:fieldId/bookings` | Owner / Admin | Xem danh sách đơn đặt sân tại cụm sân |
| | `GET` | `/owner/fields/:fieldId/bookings/:bookingId` | Owner / Admin | Xem chi tiết đơn đặt sân thuộc cụm sân |
| | `POST` | `/owner/fields/:fieldId/bookings/:bookingId/confirm` | Owner / Admin | Xác nhận đơn và gán sân con (Khóa bi quan chống double-booking) |
| | `POST` | `/owner/fields/:fieldId/bookings/:bookingId/reject` | Owner / Admin | Từ chối đơn đặt sân đang chờ |
| | `POST` | `/owner/fields/:fieldId/bookings/:bookingId/cancel` | Owner / Admin | Chủ sân hủy đơn sân kèm lý do |
| | `POST` | `/owner/fields/:fieldId/bookings/:bookingId/complete` | Owner / Admin | Đánh dấu hoàn tất trận đấu |
| **Tổng quan chủ sân** | `GET` | `/owner/dashboard/stats` | Owner / Active | Số liệu và đơn gần đây trên tất cả sân của tài khoản |
| **Tìm đối & Bình luận** | `GET` | `/posts` | Public | Lấy danh sách bài đăng tìm đối công khai |
| | `GET` | `/posts/me` | User / Active | Lấy danh sách bài đăng tìm đối của chính mình |
| | `GET` | `/posts/:id` | Public | Lấy chi tiết một bài đăng tìm đối |
| | `POST` | `/posts` | User / Active | Tạo bài đăng tìm đối giao lưu mới |
| | `PATCH` | `/posts/:id` | User (Chính chủ) | Cập nhật thông tin bài đăng tìm đối |
| | `DELETE` | `/posts/:id` | User (Chính chủ) | Đóng / Xóa bài đăng tìm đối |
| | `POST` | `/posts/:id/matches` | User / Active | Gửi yêu cầu xin ghép đối cho bài đăng |
| | `GET` | `/posts/:id/matches` | User / Active | Xem danh sách các đội xin ghép đối |
| | `PATCH` | `/posts/:id/matches/:matchId/accept` | User (Chính chủ bài) | Chấp nhận đội bắt đối (đóng ghép) |
| | `PATCH` | `/posts/:id/matches/:matchId/reject` | User (Chính chủ bài) | Từ chối đội bắt đối |
| | `DELETE` | `/posts/:id/matches/me` | User / Active | Người xin ghép đối tự rút lại yêu cầu |
| | `GET` | `/posts/:id/comments` | Public | Lấy danh sách bình luận dưới bài đăng |
| | `POST` | `/posts/:id/comments` | User / Active | Gửi bình luận vào bài đăng |
| **Hồ sơ cá nhân** | `GET` | `/user-profiles/me` | User / Active | Lấy thông tin hồ sơ của tài khoản đang đăng nhập |
| | `PATCH` | `/user-profiles/me` | User / Active | Cập nhật thông tin hồ sơ cá nhân và vị trí |
| | `PATCH` | `/user-profiles/me/location` | User / Active | Cập nhật nhanh tọa độ vị trí người dùng (lat, lng) |
| **Hồ sơ & Đăng ký chủ sân** | `POST` | `/owner-registration` | User / Active | Gửi đơn đăng ký trở thành chủ sân |
| | `GET` | `/owner-registration/status` | User / Active | Kiểm tra tiến trình phê duyệt hồ sơ chủ sân |
| | `GET` | `/owner-profiles/me` | User / Active | Lấy hồ sơ chủ sân của tài khoản hiện tại |
| | `PATCH` | `/owner-profiles/me` | User / Active | Cập nhật hồ sơ chủ sân của tài khoản hiện tại |
| | `GET` | `/owner-profiles/:id` | Public | Xem hồ sơ công khai của một chủ sân |
| **Phê duyệt quản trị (Admin)**| `GET` | `/admin/overview` | Admin | Lấy số liệu tổng quan vận hành hệ thống (KPI, biểu đồ, health, queue, audit) |
| | `GET` | `/admin/owner-approvals` | Admin | Lấy danh sách hồ sơ đăng ký chủ sân cần duyệt |
| | `GET` | `/admin/owner-approvals/:id` | Admin | Xem chi tiết hồ sơ đăng ký chủ sân |
| | `POST` | `/admin/owner-approvals/:id/approve` | Admin | Phê duyệt hồ sơ đăng ký chủ sân |
| | `POST` | `/admin/owner-approvals/:id/reject` | Admin | Từ chối hồ sơ đăng ký chủ sân |
| | `GET` | `/admin/field-approvals` | Admin | Lấy danh sách yêu cầu duyệt sân bóng |
| | `GET` | `/admin/field-approvals/:id` | Admin | Xem chi tiết yêu cầu duyệt sân bóng |
| | `POST` | `/admin/field-approvals/:id/approve` | Admin | Phê duyệt sân bóng |
| | `POST` | `/admin/field-approvals/:id/reject` | Admin | Từ chối phê duyệt sân bóng |
| **Hệ thống** | `GET` | `/` | Public | Kiểm tra tình trạng hoạt động backend (Health check) |
| **Real-time Chat** | `WS` | `/chat` | Đã đăng nhập (JWT) | WebSocket Gateway nhắn tin trực tiếp |
| | `GET` | `/chat/conversations` | Đã đăng nhập (JWT) | Lấy danh sách cuộc trò chuyện của tôi |
| | `POST` | `/chat/conversations` | Đã đăng nhập (JWT) | Bắt đầu hoặc lấy cuộc trò chuyện |
| | `GET` | `/chat/conversations/:id/messages` | Đã đăng nhập (JWT) | Lấy lịch sử tin nhắn (hỗ trợ phân trang limit/before) |
| | `DELETE` | `/chat/conversations/:id` | Đã đăng nhập (JWT) | Xóa cuộc trò chuyện (xóa 1 phía hoặc xóa hoàn toàn 2 phía) |
| **Tải lên tệp (Upload)** | `POST` | `/upload/image` | User / Active | Tải ảnh lên Supabase hoặc lưu cục bộ khi phát triển |
| | `GET` | `/upload/local/:name` | Public / Development | Trả nội dung ảnh đã tải lên cục bộ |
| **Đánh giá sân bóng** | `POST` | `/reviews/fields` | User / Active | Gửi đánh giá và chấm sao cho sân sau khi hoàn tất đặt sân |
| | `GET` | `/reviews/fields/:fieldId` | Public | Lấy danh sách đánh giá công khai của sân bóng |
| | `GET` | `/reviews/fields/:fieldId/summary` | Public | Xem tổng hợp điểm rating và điểm bayesian của sân bóng |
| | `POST` | `/reviews/fields/:id/report` | User / Active | Báo cáo đánh giá sân bóng |
| | `PATCH` | `/reviews/fields/:id/moderate` | Admin | Quản trị viên duyệt / ẩn đánh giá sân |
| **Đánh giá người chơi** | `POST` | `/reviews/users` | User / Active | Đánh giá tinh thần thể thao của người chơi sau trận đấu |
| | `GET` | `/reviews/users/:userId` | Public | Xem danh sách đánh giá của một người chơi |
| | `GET` | `/reviews/users/:userId/summary` | Public | Xem tổng hợp điểm tinh thần thể thao của người chơi |
| | `POST` | `/reviews/users/:id/report` | User / Active | Báo cáo đánh giá người chơi |
| | `PATCH` | `/reviews/users/:id/moderate` | Admin | Quản trị viên duyệt / ẩn đánh giá người chơi |
| **Bảng xếp hạng** | `GET` | `/rankings/fields` | Public | Lấy BXH Top sân bóng uy tín theo điểm Bayesian |
| | `GET` | `/rankings/players` | Public | Lấy BXH Top người chơi theo điểm tinh thần thể thao |
| | `GET` | `/fields/rankings/top` | Public | Lấy top sân bóng có điểm Bayesian cao nhất |
| **Gói dịch vụ (Subscription)** | `POST` | `/subscription-plans` | Admin | Tạo gói hội viên dịch vụ mới |
| | `GET` | `/subscription-plans` | Public | Xem danh sách gói hội viên đang mở |
| | `POST` | `/subscriptions` | User / Active | Đăng ký gói hội viên dịch vụ |
| | `GET` | `/subscriptions/me` | User / Active | Xem thông tin gói hội viên của bản thân |
| | `DELETE` | `/subscriptions/:id` | User / Active | Hủy gói hội viên dịch vụ |
| **Trợ lý AI** | `POST` | `/ai/matchmaking/suggestions` | User / Active | Gợi ý ghép trận thông minh bằng AI |
| | `GET` | `/ai/usage/me` | User / Active | Xem hạn mức và số lượt AI đã sử dụng |

---

## 3. Chi Tiết Từng Nhóm API

### 3.1. Xác thực (Authentication)

#### 3.1.1. Đăng ký tài khoản (`POST /auth/register`)
- **Quyền truy cập:** Public
- **Request Body (`RegisterRequestDto`):**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123@",
    "phone": "0901234567",       // Tùy chọn (1 - 32 ký tự)
    "fullName": "Nguyễn Văn A"   // Tùy chọn (1 - 255 ký tự)
  }
  ```
- **Response (`201 Created` - `RegisterResponseDto`):**
  ```json
  {
    "messageKey": "success.registerSuccess",
    "data": {
      "id": "67b938ef-5e74-42b7-a37a-d34e9e1bb342",
      "email": "user@example.com",
      "role": "user",
      "authProvider": "local",
      "profile": {
        "fullName": "Nguyễn Văn A"
      }
    }
  }
  ```

#### 3.1.2. Đăng nhập (`POST /auth/login`)
- **Quyền truy cập:** Public
- **Request Body (`LoginRequestDto`):**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123@"
  }
  ```
- **Set-Cookie Header:** Tự động set cookie `refreshToken` (HttpOnly, SameSite, Secure nếu production).
- **Response (`200 OK` - `LoginResponseDto`):**
  ```json
  {
    "messageKey": "success.loginSuccess",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "Bearer",
      "expiresIn": 900,
      "user": {
        "id": "67b938ef-5e74-42b7-a37a-d34e9e1bb342",
        "email": "user@example.com",
        "role": "user",
        "status": "active",
        "authProvider": "local"
      }
    }
  }
  ```
- **Mã lỗi đặc thù:**
  - `INVALID_CREDENTIALS` (`401 Unauthorized`): Sai email hoặc mật khẩu.
  - `ACCOUNT_SUSPENDED` (`403 Forbidden`): Tài khoản đang ở trạng thái `suspended` (không cấp phát token).
  - `ACCOUNT_BANNED` (`403 Forbidden`): Tài khoản bị cấm vĩnh viễn (`banned`).

#### 3.1.3. Đăng nhập bằng Google (`POST /auth/google`)
- **Quyền truy cập:** Public
- **Request Body (`GoogleLoginRequestDto`):**
  ```json
  {
    "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij..."
  }
  ```
- **Response (`200 OK` - `GoogleLoginResponseDto`):**
  Tương tự `POST /auth/login`.

#### 3.1.4. Làm mới Token (`POST /auth/refresh`)
- **Quyền truy cập:** Public (Đọc token từ Cookie hoặc Request Body)
- **Request Body (`RefreshTokenRequestDto` - Tùy chọn nếu đã có cookie):**
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1Ni..."
  }
  ```
- **Response (`200 OK` - `RefreshTokenResponseDto`):**
  ```json
  {
    "messageKey": "success.refreshSuccess",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1Ni...",
      "tokenType": "Bearer",
      "expiresIn": 900,
      "user": {
        "id": "67b938ef-5e74-42b7-a37a-d34e9e1bb342",
        "email": "user@example.com",
        "role": "user",
        "status": "active",
        "authProvider": "local"
      }
    }
  }
  ```

#### 3.1.5. Đăng xuất (`POST /auth/logout`)
- **Quyền truy cập:** Yêu cầu đăng nhập
- **Request Body (`RefreshTokenRequestDto` - Tùy chọn nếu đã có cookie):**
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1Ni..."
  }
  ```
- **Response (`200 OK` - `LogoutResponseDto`):**
  ```json
  {
    "messageKey": "success.logoutSuccess",
    "data": null
  }
  ```

---

### 3.2. Quản Lý Sân Bóng (Field Management)

#### 3.2.1. Lấy danh sách sân công khai (`GET /fields`)
- **Quyền truy cập:** Public
- **Query Parameters (`PublicFieldQueryDto`):**
  - `page` *(number, mặc định: 1)*: Trang hiện tại.
  - `limit` *(number, mặc định: 10, max: 100)*: Số lượng kết quả/trang.
  - `search` *(string, tùy chọn)*: Tìm kiếm theo tên hoặc địa chỉ.
  - `district` *(string, tùy chọn)*: Lọc theo quận/huyện.
  - `requireDeposit` *(boolean, tùy chọn)*: Lọc theo yêu cầu cọc tiền (`true`/`false`).
  - `sortBy` *(enum: `createdAt`, `name`, mặc định: `createdAt`)*: Tiêu chí sắp xếp.
  - `sortOrder` *(enum: `ASC`, `DESC`, mặc định: `DESC`)*: Thứ tự sắp xếp.
- **Response (`200 OK` - `FieldListResponseDto`):**
  ```json
  {
    "items": [
      {
        "id": "d3b07384-d113-40e1-95b6-75399589d6e4",
        "ownerId": "b7c12345-d113-40e1-95b6-75399589d6e4",
        "name": "Sân bóng Tân Bình Sport Complex",
        "address": "120 Hoàng Hoa Thám, Phường 12",
        "district": "Tân Bình",
        "lat": 10.798123,
        "lng": 106.654321,
        "description": "Cụm sân cỏ nhân tạo tiêu chuẩn...",
        "status": "active",
        "requireDeposit": true,
        "depositType": "fixed",
        "depositValue": 100000,
        "createdAt": "2026-10-04T12:00:00.000Z",
        "updatedAt": "2026-10-04T12:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
  ```

#### 3.2.2. Xem chi tiết sân bóng (`GET /fields/:id`)
- **Quyền truy cập:** Public
- **Path Parameters:**
  - `id` *(UUID)*: ID của cụm sân.
- **Response (`200 OK` - `FieldResponseDto`):** Chi tiết đối tượng cụm sân như trong mảng `items`.

#### 3.2.3. Chủ sân tạo cụm sân bóng mới (`POST /owner/fields`)
- **Quyền truy cập:** Đã đăng nhập, quyền `owner` hoặc `admin`, trạng thái `active`.
- **Request Body (`CreateFieldDto`):**
  ```json
  {
    "name": "Sân bóng Tân Bình Sport Complex", // Bắt buộc, max 255
    "address": "120 Hoàng Hoa Thám, Phường 12", // Bắt buộc, max 255
    "district": "Tân Bình",                     // Tùy chọn, max 100
    "lat": 10.798123,                           // Tùy chọn (-90 đến 90)
    "lng": 106.654321,                          // Tùy chọn (-180 đến 180)
    "description": "Sân mới nâng cấp mặt cỏ",    // Tùy chọn
    "requireDeposit": true,                     // Tùy chọn, default: false
    "depositType": "fixed",                     // Bắt buộc nếu requireDeposit=true: "fixed" | "percentage"
    "depositValue": 100000                      // Bắt buộc nếu requireDeposit=true (>= 0)
  }
  ```
- **Response (`201 Created` - `FieldResponseDto`):** Thông tin cụm sân vừa được tạo (trạng thái ban đầu: `pending` chờ admin duyệt).

#### 3.2.4. Chủ sân lấy danh sách sân của mình (`GET /owner/fields`)
- **Quyền truy cập:** `owner`, `admin` (Active)
- **Query Parameters (`OwnerFieldQueryDto`):**
  - `page` *(number, mặc định: 1)*
  - `limit` *(number, mặc định: 10)*
  - `search` *(string, tùy chọn)*
  - `status` *(enum: `pending`, `active`, `inactive`, `rejected`)*
- **Response (`200 OK` - `FieldListResponseDto`)**

#### 3.2.5. Chủ sân xem chi tiết sân của mình (`GET /owner/fields/:id`)
- **Quyền truy cập:** `owner`, `admin` (Yêu cầu quyền sở hữu sân qua `FieldOwnershipGuard`)
- **Response (`200 OK` - `FieldResponseDto`)**

#### 3.2.6. Chủ sân chỉnh sửa thông tin sân (`PATCH /owner/fields/:id`)
- **Quyền truy cập:** `owner`, `admin` (Yêu cầu quyền sở hữu sân)
- **Request Body (`UpdateFieldDto`):** Các trường tùy chọn của `CreateFieldDto`.
- **Response (`200 OK` - `FieldResponseDto`)**

#### 3.2.7. Chủ sân vô hiệu hóa cụm sân (`DELETE /owner/fields/:id`)
- **Quyền truy cập:** `owner`, `admin` (Yêu cầu quyền sở hữu sân)
- **Response (`200 OK` - `FieldResponseDto`):** Cụm sân chuyển trạng thái sang `inactive`.

---


#### 3.2.8. Quản lý sân con (Courts - FIELD-03)
- **Tạo sân con mới (`POST /owner/fields/:fieldId/courts`):**
  - **Quyền truy cập:** `owner`, `admin` (Bảo vệ bởi `FieldOwnershipGuard`)
  - **Request Body (`CreateFieldCourtDto`):**
    ```json
    {
      "name": "Sân 1 (5 người)",
      "type": "5",                     // "5" | "7" | "11"
      "status": "active"               // "active" | "inactive" | "maintenance" (mặc định: "active")
    }
    ```
  - **Response (`201 Created` - `FieldCourtResponseDto`):** Trả về thông tin sân con vừa tạo.
  - **Mã lỗi đặc thù:** `COURT_NAME_ALREADY_EXISTS` (409 Conflict) khi tên sân con bị trùng trong cùng cụm sân.
- **Lấy danh sách sân con (`GET /owner/fields/:fieldId/courts`):**
  - **Query Parameters:** `type` (tùy chọn: 5, 7, 11), `status` (tùy chọn: active, inactive, maintenance).
  - **Response (`200 OK`):** Mảng danh sách các sân con thuộc cụm sân.
- **Chi tiết sân con (`GET /owner/fields/:fieldId/courts/:courtId`):**
  - **Response (`200 OK` - `FieldCourtResponseDto`)**
- **Cập nhật sân con (`PATCH /owner/fields/:fieldId/courts/:courtId`):**
  - **Request Body (`UpdateFieldCourtDto`):** Các trường tùy chọn `name`, `type`, `status`.
  - **Response (`200 OK` - `FieldCourtResponseDto`)**
- **Vô hiệu hóa sân con (`DELETE /owner/fields/:fieldId/courts/:courtId`):**
  - **Response (`200 OK` - `FieldCourtResponseDto`):** Chuyển trạng thái sang `inactive`.

#### 3.2.9. Quản lý thư viện hình ảnh cụm sân (Images - FIELD-04)
- **Thêm hình ảnh (`POST /owner/fields/:fieldId/images`):**
  - **Quyền truy cập:** `owner`, `admin`
  - **Request Body (`CreateFieldImageDto`):**
    ```json
    {
      "url": "https://storage.example.com/fields/pitch-overview.jpg",
      "displayOrder": 0,
      "isThumbnail": true               // Nếu true: tự động unmark thumbnail cũ trong transaction
    }
    ```
  - **Response (`201 Created` - `FieldImageResponseDto`)**
- **Lấy danh sách hình ảnh (`GET /owner/fields/:fieldId/images`):**
  - **Response (`200 OK`):** Danh sách ảnh được sắp xếp theo `displayOrder ASC`.
- **Cập nhật hình ảnh (`PATCH /owner/fields/:fieldId/images/:imageId`):**
  - **Request Body (`UpdateFieldImageDto`):** `displayOrder`, `isThumbnail`.
  - **Response (`200 OK` - `FieldImageResponseDto`)**
- **Xóa hình ảnh (`DELETE /owner/fields/:fieldId/images/:imageId`):**
  - **Response (`200 OK` - `FieldImageResponseDto`)**

#### 3.2.10. Quản lý dịch vụ đi kèm (Services - FIELD-05)
- **Tạo dịch vụ (`POST /owner/fields/:fieldId/services`):**
  - **Quyền truy cập:** `owner`, `admin`
  - **Request Body (`CreateFieldServiceDto`):**
    ```json
    {
      "name": "Thuê bóng thi đấu",
      "price": 50000,                   // Đơn giá >= 0
      "unit": "quả / trận",
      "isActive": true
    }
    ```
  - **Response (`201 Created` - `FieldServiceResponseDto`)**
  - **Mã lỗi đặc thù:** `SERVICE_NAME_ALREADY_EXISTS` (409 Conflict) khi trùng tên dịch vụ trong cụm sân.
- **Danh sách dịch vụ (`GET /owner/fields/:fieldId/services`):**
  - **Query Parameters:** `isActive` (boolean, tùy chọn).
  - **Response (`200 OK`):** Mảng danh sách dịch vụ đi kèm.
- **Cập nhật dịch vụ (`PATCH /owner/fields/:fieldId/services/:serviceId`):**
  - **Request Body (`UpdateFieldServiceDto`):** `name`, `price`, `unit`, `isActive`.
  - **Response (`200 OK` - `FieldServiceResponseDto`)**
- **Tắt trạng thái hoạt động (`DELETE /owner/fields/:fieldId/services/:serviceId`):**
  - **Response (`200 OK` - `FieldServiceResponseDto`):** Đặt `isActive = false`.

#### 3.2.11. Cấu hình giờ mở cửa theo tuần (Opening Hours - FIELD-06)
- **Cập nhật tuần hoàn 7 ngày (`PUT /owner/fields/:fieldId/opening-hours`):**
  - **Quyền truy cập:** `owner`, `admin`
  - **Request Body (`UpsertFieldOpeningHoursDto`):**
    ```json
    {
      "hours": [
        { "dayOfWeek": 1, "openTime": "06:00", "closeTime": "22:00", "isClosed": false },
        { "dayOfWeek": 2, "openTime": "06:00", "closeTime": "22:00", "isClosed": false },
        { "dayOfWeek": 3, "openTime": "06:00", "closeTime": "22:00", "isClosed": false },
        { "dayOfWeek": 4, "openTime": "06:00", "closeTime": "22:00", "isClosed": false },
        { "dayOfWeek": 5, "openTime": "06:00", "closeTime": "22:00", "isClosed": false },
        { "dayOfWeek": 6, "openTime": "06:00", "closeTime": "23:00", "isClosed": false },
        { "dayOfWeek": 7, "openTime": "06:00", "closeTime": "23:00", "isClosed": false }
      ]
    }
    ```
  - **Response (`200 OK` - Mảng `FieldOpeningHourResponseDto`):** Cập nhật nguyên tử toàn bộ lịch tuần.
  - **Ràng buộc kiểm tra:** `dayOfWeek` từ 1 đến 7; khi `isClosed = false`, bắt buộc `openTime < closeTime` (`INVALID_TIME_RANGE` - 400).
- **Xem giờ mở cửa (`GET /owner/fields/:fieldId/opening-hours`):**
  - **Response (`200 OK`):** Danh sách 7 ngày trong tuần theo thứ tự từ Thứ Hai đến Chủ Nhật.

#### 3.2.12. Quản lý khóa lịch sân con chống chồng chéo (Blocked Slots - FIELD-07)
- **Tạo khoảng khóa lịch sân con (`POST /owner/fields/:fieldId/courts/:courtId/blocked-slots`):**
  - **Quyền truy cập:** `owner`, `admin`
  - **Request Body (`CreateBlockedSlotDto`):**
    ```json
    {
      "blockedDate": "2026-10-25",
      "startTime": "08:00",
      "endTime": "10:00",
      "reason": "Bảo trì định kỳ thay mặt cỏ"
    }
    ```
  - **Response (`201 Created` - `BlockedSlotResponseDto`)**
  - **Thuật toán kiểm tra chống chồng chéo:**
    - Khoảng thời gian bị khóa không được phép giao nhau: `existing.startTime < new.endTime AND existing.endTime > new.startTime`.
    - Trùng lặp sẽ trả về mã lỗi `BLOCKED_SLOT_OVERLAP` (409 Conflict).
    - Các khoảng thời gian tiếp xúc điểm biên (ví dụ: `08:00 - 10:00` và `10:00 - 12:00`) được phép tạo bình thường.
- **Lấy danh sách khóa lịch (`GET /owner/fields/:fieldId/courts/:courtId/blocked-slots`):**
  - **Query Parameters:** `date` (lọc chính xác ngày), hoặc `startDate` và `endDate` (lọc theo khoảng ngày).
  - **Response (`200 OK`):** Mảng danh sách khung giờ bị khóa của sân con.
- **Mở khóa sân con (`DELETE /owner/fields/:fieldId/courts/:courtId/blocked-slots/:slotId`):**
  - **Response (`200 OK` - `BlockedSlotResponseDto`):** Xóa bản ghi khóa lịch thành công.

---

#### 3.2.13. Quản lý bảng giá & Tình trạng sân (Pricing & Availability - PRICE-01, PRICE-02, AVAIL-01, AVAIL-02, AVAIL-03)

- **Cấu hình bảng giá sân con (`POST /owner/fields/:fieldId/pricing`):**
  - **Quyền truy cập:** `owner`, `admin`
  - **Request Body (`CreateFieldPricingDto`):**
    ```json
    {
      "courtType": "5",
      "dayType": "weekday",
      "startTime": "06:00",
      "endTime": "17:00",
      "price": 200000
    }
    ```
  - **Response (`201 Created` - `FieldPricingResponseDto`)**
  - **Chống chồng chéo quy tắc giá:**
    - Cùng `fieldId`, `courtType`, `dayType` không được giao khoảng thời gian: `existing.startTime < new.endTime AND existing.endTime > new.startTime`.
    - Trùng lặp trả về `PRICING_SLOT_OVERLAP` (409 Conflict).
    - Tiếp xúc biên (`06:00 - 17:00` và `17:00 - 22:00`) hợp lệ.

- **Lấy danh sách bảng giá (`GET /owner/fields/:fieldId/pricing`):**
  - **Query Parameters:** `courtType` ('5' | '7' | '11'), `dayType` ('weekday' | 'weekend' | 'holiday').
  - **Response (`200 OK`):** Mảng các quy tắc giá `FieldPricingResponseDto[]`.

- **Cập nhật quy tắc giá (`PATCH /owner/fields/:fieldId/pricing/:pricingId`):**
  - **Request Body (`UpdateFieldPricingDto`):** Cho phép cập nhật từng phần (`courtType`, `dayType`, `startTime`, `endTime`, `price`).

- **Xóa quy tắc giá (`DELETE /owner/fields/:fieldId/pricing/:pricingId`):**
  - **Response (`200 OK`):** `{ "success": true }`.

- **Tính toán báo giá đặt sân (`GET /fields/:fieldId/pricing/quote`):**
  - **Quyền truy cập:** Public
  - **Query Parameters:** `courtType` (bắt buộc), `date` (YYYY-MM-DD), `startTime` (HH:mm), `endTime` (HH:mm).
  - **Response (`200 OK` - `PriceQuoteResponseDto`):**
    ```json
    {
      "fieldId": "uuid",
      "courtType": "5",
      "date": "2026-10-26",
      "dayType": "weekday",
      "startTime": "16:00",
      "endTime": "18:00",
      "totalDurationHours": 2,
      "totalPrice": 500000,
      "breakdowns": [
        {
          "startTime": "16:00",
          "endTime": "17:00",
          "durationHours": 1,
          "hourlyPrice": 200000,
          "subtotal": 200000
        },
        {
          "startTime": "17:00",
          "endTime": "18:00",
          "durationHours": 1,
          "hourlyPrice": 300000,
          "subtotal": 300000
        }
      ]
    }
    ```
  - **Quy tắc tính toán:**
    - Tự động xác định `dayType` theo ngày trong tuần (Thứ 2 - Thứ 6 là `weekday`, Thứ 7 - CN là `weekend`).
    - Kiểm tra nằm trọn trong giờ mở cửa của sân (`OUTSIDE_OPENING_HOURS` nếu vi phạm).
    - Chia nhỏ khung giờ qua các mốc giá khác nhau và tính tổng tiền chính xác. Báo lỗi `PRICE_CONFIGURATION_MISSING` nếu thiếu khung giá.

- **Kiểm tra tình trạng trống của sân (`GET /fields/:fieldId/availability`):**
  - **Quyền truy cập:** Public
  - **Query Parameters:** `courtType` (bắt buộc), `date` (YYYY-MM-DD), `startTime` (HH:mm), `endTime` (HH:mm).
  - **Response (`200 OK` - `FieldAvailabilityResponseDto`):**
    ```json
    {
      "fieldId": "uuid",
      "courtType": "5",
      "date": "2026-10-26",
      "startTime": "08:00",
      "endTime": "10:00",
      "isAvailable": true,
      "availableCourtsCount": 1,
      "totalCourtsCount": 2,
      "availableCourtIds": ["court-uuid-2"]
    }
    ```
  - **Thuật toán khả dụng:** Sân con khả dụng khi và chỉ khi: sân đang `active` AND không có `blocked_slot` giao nhau AND không có `booking` (khác trạng thái `cancelled`, `rejected`) giao nhau.

- **Xem trực quan timeline sân con của chủ sân (`GET /owner/fields/:fieldId/courts/timeline`):**
  - **Quyền truy cập:** `owner`, `admin`
  - **Query Parameters:** `date` (YYYY-MM-DD, mặc định hôm nay).
  - **Response (`200 OK` - `CourtTimelineResponseDto`):** Trả về danh sách từng sân con kèm các slot bận (đã đặt hoặc bị khóa) trong ngày.

- **Kiểm tra tính hợp lệ khi gán sân con (`GET /owner/fields/:fieldId/courts/:courtId/check-assignment`):**
  - **Quyền truy cập:** `owner`, `admin`
  - **Query Parameters:** `courtType`, `date`, `startTime`, `endTime`.
  - **Response (`200 OK` - `CheckCourtAssignmentResponseDto`):** `{ "courtId": "uuid", "canAssign": true }`.

---

### 3.3. Tìm Đối & Bình Luận (Posts & Matchmaking)

#### 3.3.1. Lấy danh sách bài đăng tìm đối (`GET /posts`)
- **Quyền truy cập:** Public
- **Query Parameters (`QueryPostDto`):**
  - `page` *(number, default: 1)*
  - `limit` *(number, default: 10, max: 50)*
  - `search` *(string)*: Tìm theo tiêu đề, mô tả.
  - `skillLevel` *(string)*: Trình độ yêu cầu.
  - `playDate` *(string: YYYY-MM-DD)*: Ngày đá bóng.
  - `status` *(string: `open`, `matched`, `closed`)*
- **Response (`200 OK`):**
  ```json
  {
    "items": [
      {
        "id": "e7b01859-99a3-48eb-bf44-64df753b8901",
        "userId": "67b938ef-5e74-42b7-a37a-d34e9e1bb342",
        "title": "Tìm kèo giao hữu 7v7 tối thứ 6 sân Chánh Hưng",
        "content": "Đội mình trung bình, đá văn minh không va chạm...",
        "playDate": "2026-10-25",
        "startTime": "19:00",
        "endTime": "20:30",
        "skillLevelRequired": "Trung bình",
        "maxPlayers": 14,
        "currentPlayers": 0,
        "lat": "10.762622",
        "lng": "106.660172",
        "status": "open",
        "createdAt": "2026-10-19T10:00:00.000Z",
        "user": {
          "id": "67b938ef-5e74-42b7-a37a-d34e9e1bb342",
          "email": "user@example.com",
          "profile": { "fullName": "Nguyễn Văn A" }
        }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
  ```

#### 3.3.2. Lấy danh sách bài đăng của tôi (`GET /posts/me`)
- **Quyền truy cập:** Đã đăng nhập (Active)
- **Query Parameters:** `page`, `limit`, `status`.
- **Response (`200 OK`):** Danh sách bài đăng của tài khoản hiện tại.

#### 3.3.3. Xem chi tiết bài đăng (`GET /posts/:id`)
- **Quyền truy cập:** Public
- **Response (`200 OK`):** Chi tiết bài đăng kèm thông tin người tạo.

#### 3.3.4. Tạo bài đăng tìm đối (`POST /posts`)
- **Quyền truy cập:** Đã đăng nhập (Active)
- **Request Body (`CreatePostDto`):**
  ```json
  {
    "title": "Tìm kèo giao hữu 7v7 tối thứ 6", // Bắt buộc, max 255
    "content": "Tiền sân 5-5...",                // Tùy chọn
    "playDate": "2026-10-25",                   // Bắt buộc (YYYY-MM-DD)
    "startTime": "19:00",                       // Bắt buộc (HH:mm)
    "endTime": "20:30",                         // Tùy chọn (HH:mm)
    "skillLevelRequired": "Trung bình",         // Tùy chọn
    "maxPlayers": 14,                           // Bắt buộc, số người (2 đến 30)
    "lat": 10.762622,                           // Tùy chọn
    "lng": 106.660172                           // Tùy chọn
  }
  ```
- **Response (`201 Created`):** Chi tiết `PostEntity` vừa tạo.

#### 3.3.5. Chỉnh sửa bài đăng (`PATCH /posts/:id`)
- **Quyền truy cập:** Đã đăng nhập (Chính chủ bài đăng)
- **Request Body (`UpdatePostDto`):**
  Các trường của `CreatePostDto` + `status` (`"open"` | `"matched"` | `"closed"`).
- **Response (`200 OK`):** Chi tiết `PostEntity` sau chỉnh sửa.

#### 3.3.6. Xóa / Đóng bài đăng (`DELETE /posts/:id`)
- **Quyền truy cập:** Đã đăng nhập (Chính chủ bài đăng)
- **Response (`204 No Content`):** Chuyển `status` thành `closed` và ghi nhận `deletedAt`.

#### 3.3.7. Gửi yêu cầu bắt đối (`POST /posts/:id/matches`)
- **Quyền truy cập:** Đã đăng nhập (Không được tự bắt đối bài của chính mình)
- **Path Parameters:** `id` (Post ID).
- **Response (`201 Created`):**
  ```json
  {
    "id": "184d0b13-79d1-419b-b0b9-a429a3b68832",
    "postId": "e7b01859-99a3-48eb-bf44-64df753b8901",
    "applicantId": "50c4bb26-5b43-41bb-a3ee-8ecf62c0bc14",
    "status": "pending",
    "conversationId": null,
    "createdAt": "2026-10-19T10:15:00.000Z"
  }
  ```

#### 3.3.8. Xem danh sách đội xin bắt đối (`GET /posts/:id/matches`)
- **Quyền truy cập:** Đã đăng nhập
- **Path Parameters:** `id` (Post ID).
- **Response (`200 OK`):** Mảng các `PostMatchEntity` kèm thông tin đội xin ghép.

#### 3.3.9. Chấp nhận đội bắt đối (`PATCH /posts/:id/matches/:matchId/accept`)
- **Quyền truy cập:** Đã đăng nhập (Chính chủ bài đăng)
- **Path Parameters:** `id` (Post ID), `matchId` (Match ID).
- **Mô tả:** Chấp nhận ghép trận với đội ứng tuyển (sử dụng Pessimistic Write Lock trong Database Transaction chống race condition khi duyệt đồng thời). Tự động tăng `currentPlayers` lên 1; khi đạt `maxPlayers` bài đăng sẽ chuyển `status: "matched"`. Hệ thống tự động kiểm tra: nếu đã tồn tại cuộc trò chuyện từ trước giữa 2 người dùng thì tái sử dụng, nếu chưa có thì tạo mới; đồng thời tự động gửi tin nhắn xác nhận vào phòng chat và phát WebSocket event `receive_message` cùng `match:accepted`.
- **Response (`200 OK`):** Đối tượng `PostMatchEntity` với `status: "accepted"`, liên kết `conversationId`, bài đăng tự động chuyển `status: "matched"`.

#### 3.3.10. Từ chối đội bắt đối (`PATCH /posts/:id/matches/:matchId/reject`)
- **Quyền truy cập:** Đã đăng nhập (Chính chủ bài đăng)
- **Path Parameters:** `id` (Post ID), `matchId` (Match ID).
- **Response (`200 OK`):** Đối tượng `PostMatchEntity` với `status: "rejected"`.

#### 3.3.11. Rút lại yêu cầu bắt đối (`DELETE /posts/:id/matches/me`)
- **Quyền truy cập:** Đã đăng nhập (Người nộp đơn bắt đối)
- **Path Parameters:** `id` (Post ID).
- **Response (`204 No Content`)**

#### 3.3.12. Lấy bình luận của bài đăng (`GET /posts/:id/comments`)
- **Quyền truy cập:** Public
- **Path Parameters:** `id` (Post ID).
- **Response (`200 OK`):**
  ```json
  [
    {
      "id": "cb1e56b4-f3c2-4a0b-93de-b827361a3421",
      "postId": "e7b01859-99a3-48eb-bf44-64df753b8901",
      "userId": "67b938ef-5e74-42b7-a37a-d34e9e1bb342",
      "content": "Đội mình xin giao lưu nhé!",
      "createdAt": "2026-10-19T10:20:00.000Z",
      "user": {
        "id": "67b938ef-5e74-42b7-a37a-d34e9e1bb342",
        "email": "user@example.com",
        "profile": { "fullName": "Nguyễn Văn A" }
      }
    }
  ]
  ```

#### 3.3.13. Viết bình luận vào bài đăng (`POST /posts/:id/comments`)
- **Quyền truy cập:** Đã đăng nhập (Active)
- **Path Parameters:** `id` (Post ID).
- **Request Body (`CreateCommentDto`):**
  ```json
  {
    "content": "Đội mình xin ghép trận này nhé, có sẵn bóng thi đấu." // Bắt buộc, max 1000
  }
  ```
- **Response (`201 Created`):** Chi tiết bình luận vừa tạo.

---

### 3.4. Quản lý Đặt Sân & Vòng Đời Booking (Booking Lifecycle & Concurrency)

#### Tổng quan chủ sân (`GET /owner/dashboard/stats`)

- **Quyền truy cập:** Chủ sân đang hoạt động. Chỉ đọc dữ liệu các cụm sân của tài khoản trong JWT.
- **Request:** Không có query parameters hoặc request body.
- **Response `200 OK`:** `{ success: true, data: { monthlyRevenue, todayBookings, activeFields, totalFields, bookedMinutes, availableMinutes, utilizationPercent, recentBookings } }`.
- `monthlyRevenue` là tổng giao dịch tiền đặt sân thành công trừ hoàn tiền thành công trong tháng, tính theo VND và thời điểm cập nhật giao dịch.
- `todayBookings` đếm đơn có ngày đá hôm nay, trừ đơn bị hủy hoặc từ chối. `activeFields` và `totalFields` đếm cụm sân đang hoạt động và tổng cụm sân.
- `availableMinutes` cộng giờ mở cửa của sân con đang hoạt động sau khi trừ lịch chặn. `bookedMinutes` là phần của các đơn xác nhận hoặc hoàn thành nằm trong khung giờ có thể đặt. `utilizationPercent` làm tròn theo phần trăm và trả `null` khi không có phút nào có thể đặt. Ngày và tháng tính theo `Asia/Ho_Chi_Minh`.
- `recentBookings` trả tối đa 4 đơn mới nhất theo thời gian tạo, dùng định dạng `BookingResponseDto` như API chi tiết đơn đặt.

#### 3.4.1. Ma trận chuyển đổi trạng thái đơn đặt sân (State Machine Matrix)
- `pending` -> `confirmed` (Owner/Admin) | `rejected` (Owner/Admin) | `cancelled` (User/Owner/Admin)
- `confirmed` -> `cancelled` (User/Owner/Admin) | `completed` (Owner/Admin)
- `rejected`, `cancelled`, `completed`: Trạng thái kết thúc (Terminal states), không cho phép chuyển tiếp.

#### 3.4.2. Tạo yêu cầu đặt sân (`POST /bookings`)
- **Quyền truy cập:** User đã đăng nhập (`active`)
- **Mô tả:** Khách hàng tạo yêu cầu đặt sân cho một loại sân (`courtType`: `5` | `7` | `11`) trong khung giờ cụ thể, đính kèm dịch vụ tùy chọn. Hệ thống tự động kiểm tra giờ mở cửa, tính tổng tiền, tiền cọc (30%), tạo snapshot giá dịch vụ, ghi nhận bản ghi `booking_status_histories` ban đầu (`toStatus: 'pending'`) và để `fieldCourtId = NULL`.
- **Request Body (`CreateBookingDto`):**
  ```json
  {
    "fieldId": "92bc0fa7-3798-4a7d-921d-9dae94090613",
    "courtType": "5",
    "bookingDate": "2026-10-26",
    "startTime": "08:00",
    "endTime": "10:00",
    "services": [
      {
        "serviceId": "b1b72e39-d3e9-4672-91f8-0909c0909c09",
        "quantity": 2
      }
    ]
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "c81d2977-4768-4870-a033-dcc3cca73f4d",
      "fieldId": "92bc0fa7-3798-4a7d-921d-9dae94090613",
      "requestedCourtType": "5",
      "fieldCourtId": null,
      "bookingDate": "2026-10-26",
      "startTime": "08:00",
      "endTime": "10:00",
      "status": "pending",
      "totalPrice": 440000,
      "depositAmount": 132000,
      "paymentStatus": "unpaid",
      "services": [
        {
          "serviceId": "b1b72e39-d3e9-4672-91f8-0909c0909c09",
          "quantity": 2,
          "priceSnapshot": 20000,
          "subtotal": 40000
        }
      ]
    }
  }
  ```

#### 3.4.3. Xem danh sách đơn đặt của tôi (`GET /bookings/me`)
- **Quyền truy cập:** User đã đăng nhập (`active`)
- **Query Parameters:** `status`, `bookingDate`, `page`, `limit`.
- **Response (`200 OK`):** Danh sách đơn đặt kèm phân trang.

#### 3.4.4. Xem chi tiết đơn đặt sân (`GET /bookings/:id`)
- **Quyền truy cập:** User (Chính chủ đơn)
- **Response (`200 OK`):** Chi tiết đơn đặt kèm mảng `statusHistories` theo dòng thời gian (timeline).

#### 3.4.5. Khách hàng hủy đơn đặt sân (`POST /bookings/:id/cancel`)
- **Quyền truy cập:** User (Chính chủ đơn)
- **Request Body (`CancelBookingDto`):**
  ```json
  {
    "reason": "Có việc bận đột xuất"
  }
  ```
- **Response (`200 OK`):** Chi tiết đơn đặt sân chuyển sang trạng thái `cancelled`.

#### 3.4.6. Chủ sân xem danh sách đơn đặt tại cụm sân (`GET /owner/fields/:fieldId/bookings`)
- **Quyền truy cập:** Owner (Chủ cụm sân) / Admin
- **Query Parameters:** `status`, `courtType`, `courtId`, `bookingDate`, `page`, `limit`.

#### 3.4.7. Chủ sân xem chi tiết đơn đặt (`GET /owner/fields/:fieldId/bookings/:bookingId`)
- **Quyền truy cập:** Owner (Chủ cụm sân) / Admin

#### 3.4.8. Chủ sân xác nhận và gán sân con (`POST /owner/fields/:fieldId/bookings/:bookingId/confirm`)
- **Quyền truy cập:** Owner (Chủ cụm sân) / Admin
- **Mô tả:** Sử dụng khóa bi quan (`pessimistic_write`) trong transaction TypeORM để ngăn chặn tuyệt đối tình trạng double-booking. Kiểm tra loại sân tương thích (`COURT_TYPE_MISMATCH`), xung đột lịch với các đơn đã `confirmed` hoặc các khung giờ bị khóa (`COURT_ALREADY_OCCUPIED`).
- **Request Body (`ConfirmBookingDto`):**
  ```json
  {
    "fieldCourtId": "730d0e4b-cf4f-4288-a8ad-6c92f51774b0",
    "note": "Sân 5A chuẩn bị sẵn bóng và nước"
  }
  ```
- **Response (`200 OK`):** Trạng thái chuyển thành `confirmed`, gán `fieldCourtId`.

#### 3.4.9. Chủ sân từ chối đơn đặt (`POST /owner/fields/:fieldId/bookings/:bookingId/reject`)
- **Quyền truy cập:** Owner (Chủ cụm sân) / Admin
- **Request Body (`RejectBookingDto`):**
  ```json
  {
    "reason": "Sân đang bảo trì mặt cỏ đột xuất"
  }
  ```
- **Response (`200 OK`):** Trạng thái chuyển thành `rejected`.

#### 3.4.10. Chủ sân hủy đơn đặt (`POST /owner/fields/:fieldId/bookings/:bookingId/cancel`)
- **Quyền truy cập:** Owner (Chủ cụm sân) / Admin
- **Request Body (`CancelBookingDto`):**
  ```json
  {
    "reason": "Hủy theo yêu cầu của ban quản lý sân"
  }
  ```
- **Response (`200 OK`):** Trạng thái chuyển thành `cancelled`.

#### 3.4.11. Đánh dấu hoàn tất trận đấu (`POST /owner/fields/:fieldId/bookings/:bookingId/complete`)
- **Quyền truy cập:** Owner (Chủ cụm sân) / Admin
- **Mô tả:** Chuyển trạng thái đơn từ `confirmed` sang `completed` sau khi trận đấu kết thúc.
- **Request Body:** `{}`
- **Response (`200 OK`):** Trạng thái chuyển thành `completed`.

---

### 3.5. Hồ Sơ & Đăng Ký Chủ Sân (Owner Profile & Registration)

#### 3.4.1. Nộp đơn đăng ký làm chủ sân (`POST /owner-registration`)
- **Quyền truy cập:** Đã đăng nhập (Active)
- **Request Body (`RegisterOwnerDto`):**
  ```json
  {
    "businessName": "Sân Bóng Đá Tân Bình Sport Complex", // Bắt buộc, max 255
    "businessLicense": "GPKD-0312345678",                 // Bắt buộc, max 100
    "bankAccount": "VCB - 0071000123456 - NGUYEN VAN A",   // Bắt buộc, max 100
    "note": "Mong ban quản trị xét duyệt sớm"             // Tùy chọn, max 500
  }
  ```
- **Response (`201 Created` - `OwnerRegistrationResponseDto`):**
  ```json
  {
    "id": "d3b07384-d113-40e1-95b6-75399589d6e4",
    "type": "owner_register",
    "targetId": "e0a9d1fc-3d23-45f8-b3d2-a7d9f78bc412",
    "requestedBy": "9175df40-fc7c-4d50-b07e-a35417a2eef2",
    "status": "pending",
    "note": "Mong ban quản trị xét duyệt sớm",
    "createdAt": "2026-10-19T10:00:00.000Z"
  }
  ```

#### 3.4.2. Kiểm tra tiến trình duyệt hồ sơ chủ sân (`GET /owner-registration/status`)
- **Quyền truy cập:** Đã đăng nhập (Active)
- **Response (`200 OK` - `OwnerRegistrationStatusResponseDto`):**
  ```json
  {
    "hasPendingRequest": true,
    "currentRole": "user",
    "latestRequest": {
      "id": "d3b07384-d113-40e1-95b6-75399589d6e4",
      "type": "owner_register",
      "status": "pending",
      "note": "Mong ban quản trị xét duyệt sớm",
      "createdAt": "2026-10-19T10:00:00.000Z"
    },
    "profile": null
  }
  ```

#### 3.4.3. Xem hồ sơ chủ sân cá nhân (`GET /owner-profiles/me`)
- **Quyền truy cập:** Đã đăng nhập (Active)
- **Response (`200 OK` - `OwnerProfileResponseDto`):**
  ```json
  {
    "id": "e0a9d1fc-3d23-45f8-b3d2-a7d9f78bc412",
    "userId": "9175df40-fc7c-4d50-b07e-a35417a2eef2",
    "businessName": "Sân Bóng Đá Tân Bình Sport Complex",
    "businessLicense": "GPKD-0312345678",
    "bankAccount": "VCB - 0071000123456 - NGUYEN VAN A",
    "verifiedAt": "2026-10-19T12:00:00.000Z",
    "isVerified": true,
    "createdAt": "2026-10-19T10:00:00.000Z",
    "updatedAt": "2026-10-19T12:00:00.000Z",
    "user": {
      "id": "9175df40-fc7c-4d50-b07e-a35417a2eef2",
      "email": "owner@example.com",
      "phone": "0901234567",
      "role": "owner",
      "status": "active"
    }
  }
  ```

#### 3.4.4. Cập nhật hồ sơ chủ sân cá nhân (`PATCH /owner-profiles/me`)
- **Quyền truy cập:** Đã đăng nhập (Active)
- **Request Body (`UpdateOwnerProfileDto`):**
  ```json
  {
    "businessName": "Sân Bóng Đá Tân Bình Sport Complex Mới",
    "businessLicense": "GPKD-0312345678",
    "bankAccount": "MB - 123456789 - NGUYEN VAN A"
  }
  ```
- **Response (`200 OK` - `OwnerProfileResponseDto`)**

#### 3.4.5. Xem thông tin công khai của chủ sân (`GET /owner-profiles/:id`)
- **Quyền truy cập:** Public
- **Path Parameters:** `id` (Owner Profile UUID).
- **Response (`200 OK` - `PublicOwnerProfileResponseDto`):**
  ```json
  {
    "id": "e0a9d1fc-3d23-45f8-b3d2-a7d9f78bc412",
    "businessName": "Sân Bóng Đá Tân Bình Sport Complex",
    "isVerified": true,
    "verifiedAt": "2026-10-19T12:00:00.000Z"
  }
  ```

---

### 3.6. Phê Duyệt Quản Trị (Admin Approvals)
### 3.5. Hồ Sơ Cá Nhân (User Profile)

#### 3.5.1. Xem hồ sơ cá nhân (`GET /user-profiles/me`)
- **Quyền truy cập:** Đã đăng nhập (Active)
- **Response (`200 OK` - `UserProfileResponseDto`):**
  ```json
  {
    "id": "e0a9d1fc-3d23-45f8-b3d2-a7d9f78bc412",
    "userId": "9175df40-fc7c-4d50-b07e-a35417a2eef2",
    "email": "user@pitchmaster.vn",
    "phone": "0901234567",
    "role": "user",
    "status": "active",
    "fullName": "Nguyễn Văn A",
    "avatarUrl": "https://example.com/avatar.jpg",
    "bio": "Đam mê bóng đá",
    "skillLevel": "Trung bình",
    "birthday": "1995-10-20",
    "gender": "male",
    "createdAt": "2026-10-19T10:00:00.000Z",
    "updatedAt": "2026-10-19T12:00:00.000Z"
  }
  ```

#### 3.5.2. Cập nhật hồ sơ cá nhân (`PATCH /user-profiles/me`)
- **Quyền truy cập:** Đã đăng nhập (Active)
- **Request Body (`UpdateUserProfileDto`):**
  ```json
  {
    "fullName": "Nguyễn Văn A",
    "bio": "Đam mê bóng đá, thích đá vị trí tiền vệ",
    "phone": "0901234567",
    "avatarUrl": "https://example.com/avatar.jpg",
    "skillLevel": "Trung bình",
    "birthday": "1995-10-20",
    "gender": "male"
  }
  ```
- **Response (`200 OK` - `UserProfileResponseDto`):** Chi tiết hồ sơ cá nhân sau cập nhật.

---

### 3.6. Quản Trị Hệ Thống & Phê Duyệt (Admin Overview & Approvals)

#### 3.6.0. Lấy số liệu tổng quan vận hành hệ thống (`GET /admin/overview`)
- **Quyền truy cập:** `admin` (Active)
- **Query Parameters (`AdminOverviewQueryDto`):**
  - `days` *(number, optional, default: `30`, min: `7`, max: `90`)*: Số ngày lấy dữ liệu biểu đồ hoạt động (`7`, `14`, `30`).
  - `queueLimit` *(number, optional, default: `5`, min: `1`, max: `20`)*: Số lượng bản ghi tối đa trong hàng đợi ưu tiên.
  - `auditLimit` *(number, optional, default: `10`, min: `1`, max: `50`)*: Số lượng sự kiện audit gần đây.
- **Response (`200 OK` - `AdminOverviewResponseDto`):**
  ```json
  {
    "success": true,
    "data": {
      "metrics": {
        "users": {
          "total": 1250,
          "newThisMonth": 84,
          "previousMonth": 72,
          "growthPercent": 16.67,
          "byRole": {
            "user": 1180,
            "owner": 68,
            "admin": 2
          }
        },
        "fields": {
          "active": 148,
          "total": 165,
          "pending": 12,
          "newThisMonth": 9
        },
        "gmv": {
          "currentMonthGmv": 248000000,
          "previousMonthGmv": 213000000,
          "growthPercent": 16.43,
          "totalPaidRevenue": 185000000
        },
        "queue": {
          "totalPending": 15,
          "pendingOwnerApprovals": 6,
          "pendingFieldApprovals": 7,
          "flaggedReviews": 2
        }
      },
      "activityTimeline": [
        {
          "date": "2026-10-08",
          "bookingsCount": 24,
          "gmv": 9600000,
          "newUsersCount": 5
        }
      ],
      "systemHealth": {
        "status": "operational",
        "uptimeSeconds": 86400,
        "services": [
          {
            "name": "API Gateway",
            "status": "up",
            "score": 100,
            "latencyMs": 2
          },
          {
            "name": "Database Cluster",
            "status": "up",
            "score": 99,
            "latencyMs": 8
          },
          {
            "name": "Realtime Service",
            "status": "up",
            "score": 99,
            "latencyMs": 3
          }
        ]
      },
      "priorityQueue": [
        {
          "id": "d3b07384-d113-40e1-95b6-75399589d6e4",
          "category": "OWNER_APPROVAL",
          "subType": "owner_register",
          "title": "Sân Bóng Đá Tân Bình Sport Complex",
          "requesterEmail": "owner@example.com",
          "status": "pending",
          "createdAt": "2026-11-05T10:00:00.000Z"
        }
      ],
      "recentAudits": [
        {
          "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "action": "APPROVE_FIELD",
          "actor": "admin@pitchmaster.vn",
          "target": "Sân bóng Chánh Hưng",
          "timestamp": "2026-11-06T09:30:00.000Z"
        }
      ]
    }
  }
  ```

#### 3.6.1. Lấy danh sách duyệt hồ sơ chủ sân (`GET /admin/owner-approvals`)
- **Quyền truy cập:** `admin` (Active)
- **Query Parameters (`AdminOwnerApprovalQueryDto`):**
  - `search` *(string, optional, từ khóa tìm kiếm theo email, số điện thoại người yêu cầu)*
  - `fromDate` *(string: YYYY-MM-DD, optional, lọc yêu cầu tạo từ ngày)*
  - `toDate` *(string: YYYY-MM-DD, optional, lọc yêu cầu tạo đến ngày)*
  - `status` *(enum: `pending`, `approved`, `rejected`, `all`, default: `pending`)*
  - `page` *(number, default: 1)*
  - `limit` *(number, default: 10, max: 100)*
- **Response (`200 OK` - `AdminOwnerApprovalListResponseDto`):**
  ```json
  {
    "items": [
      {
        "id": "d3b07384-d113-40e1-95b6-75399589d6e4",
        "type": "owner_register",
        "targetId": "e0a9d1fc-3d23-45f8-b3d2-a7d9f78bc412",
        "requestedBy": "9175df40-fc7c-4d50-b07e-a35417a2eef2",
        "status": "pending",
        "note": "Mong admin duyệt sớm",
        "createdAt": "2026-10-19T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
  ```

#### 3.5.2. Xem chi tiết hồ sơ duyệt chủ sân (`GET /admin/owner-approvals/:id`)
- **Quyền truy cập:** `admin` (Active)
- **Path Parameters:** `id` (Approval Request ID).
- **Response (`200 OK` - `AdminOwnerApprovalDetailResponseDto`):** Toàn bộ thông tin yêu cầu duyệt, thông tin người dùng gửi yêu cầu và hồ sơ doanh nghiệp.

#### 3.5.3. Admin duyệt đăng ký chủ sân (`POST /admin/owner-approvals/:id/approve`)
- **Quyền truy cập:** `admin` (Active)
- **Path Parameters:** `id` (Approval Request ID).
- **Request Body (`AdminApproveOwnerDto`):**
  ```json
  {
    "note": "Hồ sơ hợp lệ, đã phê duyệt quyền chủ sân." // Tùy chọn, max 500
  }
  ```
- **Response (`200 OK` - `AdminOwnerApprovalDetailResponseDto`):** Yêu cầu chuyển sang `approved`, vai trò người dùng được nâng cấp lên `owner`.

#### 3.5.4. Admin từ chối đăng ký chủ sân (`POST /admin/owner-approvals/:id/reject`)
- **Quyền truy cập:** `admin` (Active)
- **Path Parameters:** `id` (Approval Request ID).
- **Request Body (`AdminRejectOwnerDto`):**
  ```json
  {
    "reason": "Giấy phép kinh doanh không hợp lệ hoặc đã hết hạn." // Bắt buộc, max 500
  }
  ```
- **Response (`200 OK` - `AdminOwnerApprovalDetailResponseDto`):** Yêu cầu chuyển sang `rejected`.

#### 3.5.5. Lấy danh sách duyệt sân bóng (`GET /admin/field-approvals`)
- **Quyền truy cập:** `admin` (Active)
- **Query Parameters (`AdminFieldApprovalQueryDto`):**
  - `search` *(string, optional, từ khóa tìm kiếm theo tên sân bóng, địa chỉ, quận/huyện, email người yêu cầu)*
  - `fromDate` *(string: YYYY-MM-DD, optional, lọc yêu cầu tạo từ ngày)*
  - `toDate` *(string: YYYY-MM-DD, optional, lọc yêu cầu tạo đến ngày)*
  - `status` *(enum: `pending`, `approved`, `rejected`, `all`, default: `pending`)*
  - `type` *(enum: `field_create`, `field_update`, `all`, default: `all`)*
  - `page` *(number, default: 1)*
  - `limit` *(number, default: 10, max: 100)*
- **Response (`200 OK` - `AdminFieldApprovalListResponseDto`)**

#### 3.5.6. Xem chi tiết yêu cầu duyệt sân bóng (`GET /admin/field-approvals/:id`)
- **Quyền truy cập:** `admin` (Active)
- **Path Parameters:** `id` (Approval Request ID).
- **Response (`200 OK` - `AdminFieldApprovalDetailResponseDto`)**

#### 3.5.7. Admin duyệt cụm sân bóng (`POST /admin/field-approvals/:id/approve`)
- **Quyền truy cập:** `admin` (Active)
- **Path Parameters:** `id` (Approval Request ID).
- **Request Body (`AdminApproveFieldDto`):**
  ```json
  {
    "note": "Cụm sân hợp lệ." // Tùy chọn, max 500
  }
  ```
- **Response (`200 OK` - `AdminFieldApprovalDetailResponseDto`):** Cụm sân chuyển trạng thái sang `active`.

#### 3.5.8. Admin từ chối duyệt sân bóng (`POST /admin/field-approvals/:id/reject`)
- **Quyền truy cập:** `admin` (Active)
- **Path Parameters:** `id` (Approval Request ID).
- **Request Body (`AdminRejectFieldDto`):**
  ```json
  {
    "reason": "Địa chỉ cụm sân không chính xác trên bản đồ." // Bắt buộc, max 500
  }
  ```
- **Response (`200 OK` - `AdminFieldApprovalDetailResponseDto`):** Cụm sân chuyển trạng thái sang `rejected`.

---

### 3.6. Kiểm Tra Trạng Thái Hệ Thống (Health Check)

#### 3.6.1. Health Check (`GET /`)
- **Quyền truy cập:** Public
- **Response (`200 OK` - `HealthResponseDto`):**
  ```json
  {
    "status": "ok"
  }
  ```

---

### 3.7. Tin Nhắn Trực Tiếp Real-time (Chat WebSocket Gateway)

- **Namespace kết nối:** `/chat` (ví dụ `ws://localhost:3000/chat`).
- **Xác thực kết nối (Handshake Auth):**
  Gửi token qua `handshake.auth.token = "<accessToken>"` hoặc Header `Authorization: Bearer <accessToken>`. Nếu không có hoặc token không hợp lệ, socket sẽ tự động ngắt kết nối.

#### 3.7.1. Sự kiện từ Client gửi lên Server (Subscribe Messages)

| Sự kiện (Event Name) | Payload | Mô tả |
| :--- | :--- | :--- |
| `join_room` | `{"conversationId": "uuid"}` | Tham gia vào phòng chat của một cuộc trò chuyện |
| `leave_room` | `{"conversationId": "uuid"}` | Rời khỏi phòng chat của một cuộc trò chuyện |
| `send_message` | `{"conversationId": "uuid", "content": "string", "messageType": "text"}` | Gửi tin nhắn mới |
| `mark_as_delivered` | `{"conversationId": "uuid"}` | Đánh dấu tin nhắn đã được nhận |
| `mark_as_read` | `{"conversationId": "uuid"}` | Đánh dấu tin nhắn đã được đọc |
| `edit_message` | `{"messageId": "uuid", "content": "string"}` | Sửa nội dung tin nhắn đã gửi |
| `delete_message` | `{"messageId": "uuid"}` | Xóa tin nhắn |

#### 3.7.2. Sự kiện Server phát về Client (Emit Events)

| Sự kiện (Event Name) | Dữ liệu phát về (Payload) | Mô tả |
| :--- | :--- | :--- |
| `receive_message` | Đối tượng `Message` đầy đủ | Tin nhắn mới gửi tới phòng chat |
| `match:accepted` | `{"matchId": "uuid", "postId": "uuid", "conversationId": "uuid", "postTitle": "string"}` | Thông báo ghép trận thành công và phòng chat đã được tạo |
| `message_delivered` | `{"userId": "uuid", "conversationId": "uuid"}` | Thông báo người nhận đã nhận được tin nhắn |
| `message_read` | `{"userId": "uuid", "conversationId": "uuid"}` | Thông báo người nhận đã đọc tin nhắn |
| `message_edited` | Đối tượng `Message` đã cập nhật | Thông báo cập nhật nội dung tin nhắn |
| `message_deleted` | `{"messageId": "uuid", "conversationId": "uuid"}` | Thông báo tin nhắn đã bị xóa khỏi phòng |

---

### 3.8. Quản Lý Cuộc Trò Chuyện & Lịch Sử Tin Nhắn (Chat REST API)

#### 3.8.1. Lấy danh sách cuộc trò chuyện của tôi (`GET /chat/conversations`)
- **Quyền truy cập:** Đã đăng nhập (`active`)
- **Mô tả:** Trả về danh sách tất cả các cuộc trò chuyện của người dùng hiện tại, bao gồm thông tin đối phương (hoặc sân bóng), tin nhắn mới nhất, số lượng tin nhắn chưa đọc và thời gian cập nhật.
- **Response (`200 OK`):**
  ```json
  [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "type": "direct",
      "name": "Nguyễn Văn A",
      "avatarUrl": "https://example.com/avatar.jpg",
      "online": true,
      "unreadCount": 2,
      "kind": "team",
      "relatedFieldId": null,
      "relatedPostId": null,
      "lastMessage": {
        "id": "223e4567-e89b-12d3-a456-426614174001",
        "content": "Đội bạn còn cần thêm người không?",
        "senderId": "323e4567-e89b-12d3-a456-426614174002",
        "messageType": "text",
        "createdAt": "2026-10-25T09:30:00.000Z"
      },
      "updatedAt": "2026-10-25T09:30:00.000Z"
    }
  ]
  ```

#### 3.8.2. Bắt đầu hoặc lấy cuộc trò chuyện (`POST /chat/conversations`)
- **Quyền truy cập:** Đã đăng nhập (`active`)
- **Mô tả:** Tìm cuộc trò chuyện hiện có hoặc tạo mới nếu chưa tồn tại.
- **Request Body (`CreateConversationDto`):**
  ```json
  {
    "targetUserId": "323e4567-e89b-12d3-a456-426614174002",
    "relatedFieldId": null,
    "relatedPostId": null,
    "type": "direct"
  }
  ```
- **Response (`200 OK`):** Chi tiết cuộc trò chuyện.

#### 3.8.3. Lấy lịch sử tin nhắn của cuộc trò chuyện (`GET /chat/conversations/:id/messages`)
- **Quyền truy cập:** Đã đăng nhập (`active`, phải là thành viên trong cuộc trò chuyện)
- **Mô tả:** Lấy danh sách tin nhắn theo thứ tự thời gian tăng dần và tự động đánh dấu đã đọc (`last_read_at`) cho người dùng hiện tại. Hỗ trợ phân trang cuộn ngược qua `limit` và `before`.
- **Path Parameters:** `id` (UUID của hội thoại)
- **Query Parameters:**
  - `limit`: (Tùy chọn) Số lượng tin nhắn cần lấy (mặc định 20, tối đa 100).
  - `before`: (Tùy chọn) Mốc thời gian ISO (`createdAt`) để lấy các tin nhắn gửi trước thời điểm này.
- **Response (`200 OK`):**
  ```json
  [
    {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "conversationId": "123e4567-e89b-12d3-a456-426614174000",
      "senderId": "323e4567-e89b-12d3-a456-426614174002",
      "content": "Chào bạn, sân bên bạn còn trống lúc 18h không?",
      "messageType": "text",
      "isEdited": false,
      "deletedAt": null,
      "createdAt": "2026-10-25T09:15:00.000Z"
    }
  ]
  ```

#### 3.8.4. Xóa cuộc trò chuyện (`DELETE /chat/conversations/:id`)
- **Quyền truy cập:** Đã đăng nhập (`active`)
- **Path Parameters:**
  - `id`: ID của cuộc trò chuyện (UUID).
- **Cơ chế xử lý:**
  - **Cơ chế phân tách `deleted_at` & `chat_cleared_at` trong `conversation_members`:**
    - `deleted_at` (timestamptz NULL): Đánh dấu trạng thái hiển thị của cuộc trò chuyện đối với thành viên (`NULL`: đang kích hoạt; `NOT NULL`: đang bị ẩn do người dùng xóa hội thoại).
    - `chat_cleared_at` (timestamptz NULL): Mốc thời gian dọn sạch lịch sử tin nhắn của thành viên. Mốc này độc lập và được bảo lưu khi cuộc hội thoại được kích hoạt lại.
  - **Xóa 1 phía (Soft delete):** Nếu đối phương chưa xóa, hệ thống cập nhật đồng thời `deleted_at = NOW()` và `chat_cleared_at = NOW()` cho thành viên hiện tại trong bảng `conversation_members`. Cuộc trò chuyện sẽ bị ẩn khỏi danh sách của người dùng này.
  - **Tự động khôi phục khi có tin nhắn mới hoặc mở lại chat:** Khi có tin nhắn mới gửi đến hoặc người dùng mở lại cuộc trò chuyện, `deleted_at` được đặt lại về `NULL` để hội thoại tự động xuất hiện lại trên giao diện. Các tin nhắn cũ trước mốc `chat_cleared_at` vẫn được giữ ẩn, chỉ tải các tin nhắn mới gửi sau mốc này.
  - **Xóa 2 phía (Hard delete):** Chỉ kích hoạt khi **tất cả** thành viên trong cuộc trò chuyện đều có `deleted_at IS NOT NULL` (nghĩa là cả hai bên đều đang ở trạng thái xóa và chưa có tin nhắn mới nào làm phục hồi bên còn lại). Hệ thống sẽ tự động dọn dẹp toàn bộ tệp ảnh đính kèm trên Supabase Storage, đồng thời xóa vĩnh viễn toàn bộ tin nhắn, thành viên và bản ghi cuộc trò chuyện trong database.
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "hardDeleted": false
  }
  ```

#### 3.8.5. WebSocket Realtime Events (`/chat` namespace)
- **Kết nối Socket:** `io("http://localhost:3000/chat", { auth: { token: "<accessToken>" } })`
- **Sự kiện gửi từ Client lên Server:**
  - `join_room`: `{ "conversationId": "uuid" }` - Tham gia phòng hội thoại để nhận tin nhắn realtime.
  - `leave_room`: `{ "conversationId": "uuid" }` - Rời khỏi phòng hội thoại.
  - `send_message`: `{ "conversationId": "uuid", "content": "string", "messageType": "text" }` - Gửi tin nhắn mới.
  - `edit_message`: `{ "messageId": "uuid", "content": "string" }` - Chỉnh sửa tin nhắn đã gửi.
  - `delete_message`: `{ "messageId": "uuid" }` - Thu hồi tin nhắn đã gửi.
  - `mark_as_read`: `{ "conversationId": "uuid" }` - Đánh dấu đã đọc các tin nhắn trong hội thoại.
  - `mark_as_delivered`: `{ "conversationId": "uuid" }` - Đánh dấu tin nhắn đã được nhận.
- **Sự kiện Server phát xuống Client:**
  - `receive_message`: Phát tin nhắn mới đến phòng hội thoại `conversationId` và các phòng người dùng `user:${userId}` của tất cả thành viên (giúp danh sách hội thoại cập nhật realtime ngay cả khi chưa mở phòng).
  - `message_edited`: Phát thông tin tin nhắn đã chỉnh sửa (`{ id, conversationId, content, isEdited: true, ... }`) đến phòng hội thoại và phòng người dùng của các thành viên.
  - `message_deleted`: Phát thông báo thu hồi tin nhắn (`{ messageId: "uuid", conversationId: "uuid" }`) đến phòng hội thoại và phòng người dùng của các thành viên.
  - `message_read`: Phát thông báo người dùng đã đọc (`{ userId, conversationId }`).
  - `match:accepted`: Phát thông báo bài đăng ghép đối đã được chấp nhận (`{ matchId, postId, conversationId, postTitle }`).
  - `notification:new`: Sự kiện server → client trong namespace `/chat`. Không có payload yêu cầu từ client. Server gửi `{ id, type, title, content, refId, isRead: false, createdAt, link }` vào room `user:${userId}` sau khi đã lưu thông báo. Với `owner_booking_created`, `content` là tên sân, `refId` là ID đơn và `link` mở đơn trong khu vực chủ sân. Với `owner_field_approved`, `content` là tên sân, `refId` là ID sân và `link` mở danh sách sân của chủ sân.

---

### 3.9. Thông Báo (Notifications)

#### 3.9.1. Lấy danh sách thông báo (`GET /notifications`)
- **Quyền truy cập:** Đã đăng nhập (`active`)
- **Query Parameters:**
  - `filter`: (Tùy chọn) `all` hoặc `unread` (mặc định: `all`).
  - `limit`: (Tùy chọn) Số lượng thông báo lấy về (mặc định: 20).
- **Response (`200 OK`):**
  ```json
  {
    "data": [
      {
        "id": "e4b07384-d113-40e1-95b6-75399589d6e4",
        "type": "match_request",
        "title": "Yêu cầu ghép trận mới",
        "content": "Có người muốn bắt đối cho bài viết \"Kèo sân 7 tối thứ 6\".",
        "refId": "ba26ce3d-6a8a-4f21-ab6a-a5478f044db5",
        "isRead": false,
        "createdAt": "2026-10-27T14:30:00.000Z",
        "link": "/messages"
      }
    ]
  }
  ```

#### 3.9.2. Lấy số lượng thông báo chưa đọc (`GET /notifications/unread-count`)
- **Quyền truy cập:** Đã đăng nhập (`active`)
- **Response (`200 OK`):**
  ```json
  {
    "count": 3
  }
  ```

#### 3.9.3. Đánh dấu một thông báo đã đọc (`PATCH /notifications/:id/read`)
- **Quyền truy cập:** Đã đăng nhập (`active`)
- **Path Parameters:** `id` (UUID của thông báo)
- **Response (`200 OK`):**
  ```json
  {
    "success": true
  }
  ```

#### 3.9.4. Đánh dấu tất cả thông báo đã đọc (`PATCH /notifications/read-all`)
- **Quyền truy cập:** Đã đăng nhập (`active`)
- **Response (`200 OK`):**
  ```json
  {
    "success": true
  }
  ```

---

### 3.10. Tải Lên Tệp (Upload)

#### 3.10.1. Tải lên hình ảnh (`POST /upload/image`)
- **Quyền truy cập:** Đã đăng nhập (`active`)
- **Query Parameters:**
  - `folder` (optional, string): Thư mục lưu trữ trên Supabase Storage. Ví dụ: `avatars` (lưu vào `avatars/{userId}/{uuid}.ext`) hoặc `chat` (lưu vào `chat/{userId}/{uuid}.ext`). Mặc định: `chat`.
- **Content-Type:** `multipart/form-data`
- **Request Body (FormData):**
  - `file`: File hình ảnh (chấp nhận `image/jpeg`, `image/png`, `image/webp`, `image/gif`, dung lượng tối đa 10MB)
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "url": "http://127.0.0.1:3000/upload/local/810fe347-f2cb-44ca-8057-096c06cf23dc.png",
      "path": "upload/local/810fe347-f2cb-44ca-8057-096c06cf23dc.png"
    }
  }
  ```

- Khi chạy development và thiếu cấu hình Supabase, backend lưu ảnh tại `.local-uploads` và trả URL cục bộ. Khi có cấu hình Supabase, URL và đường dẫn vẫn trỏ tới kho Supabase.

#### 3.10.2. Đọc ảnh tải lên cục bộ (`GET /upload/local/:name`)

- **Quyền truy cập:** Public khi đang dùng kho ảnh cục bộ trong development.
- **Request:** Tên tệp từ phản hồi tải ảnh trong tham số `name`. Không có request body.
- **Response:** `200 OK` với nội dung nhị phân và `Content-Type` của ảnh. Trả `404` khi tệp không tồn tại hoặc kho cục bộ không hoạt động.

---

### 3.11. Hồ Sơ Cá Nhân (User Profiles)

#### 3.11.1. Lấy thông tin hồ sơ của tài khoản đang đăng nhập (`GET /user-profiles/me`)
- **Quyền truy cập:** Đã đăng nhập (`active`)
- **Response (`200 OK`):**
  ```json
  {
    "id": "e0a9d1fc-3d23-45f8-b3d2-a7d9f78bc412",
    "userId": "9175df40-fc7c-4d50-b07e-a35417a2eef2",
    "email": "user@pitchmaster.vn",
    "phone": "0901234567",
    "role": "user",
    "status": "active",
    "fullName": "Nguyễn Văn A",
    "avatarUrl": "https://edpwyenilpultbnxfent.supabase.co/storage/v1/object/public/football-pitch-manager/avatars/userid/uuid.jpg",
    "bio": "Đam mê bóng đá",
    "skillLevel": "Trung bình",
    "birthday": "1995-10-20",
    "gender": "male",
    "lat": 10.762622,
    "lng": 106.660172,
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-01T10:30:00.000Z"
  }
  ```

#### 3.11.2. Cập nhật thông tin hồ sơ (`PATCH /user-profiles/me`)
- **Quyền truy cập:** Đã đăng nhập (`active`)
- **Lưu ý nghiệp vụ:** Khi cập nhật trường `avatarUrl`, nếu avatar cũ được lưu trữ trên Supabase Storage thì hệ thống sẽ tự động xóa tệp ảnh cũ khỏi bucket Supabase để dọn dẹp dung lượng lưu trữ.
- **Request Body (JSON):**
  ```json
  {
    "fullName": "Nguyễn Văn B",
    "avatarUrl": "https://edpwyenilpultbnxfent.supabase.co/storage/v1/object/public/football-pitch-manager/avatars/userid/new-uuid.jpg",
    "bio": "Đam mê bóng đá, thích đá vị trí tiền vệ",
    "skillLevel": "Khá",
    "birthday": "1995-10-20",
    "gender": "male",
    "phone": "0909888999",
    "lat": 10.776889,
    "lng": 106.700806
  }
  ```
- **Response (`200 OK`):** Trả về đối tượng `UserProfileResponseDto` tương tự 3.11.1.

#### 3.11.3. Cập nhật nhanh vị trí người dùng (`PATCH /user-profiles/me/location`)
- **Quyền truy cập:** Đã đăng nhập (`active`)
- **Request Body (JSON):**
  ```json
  {
    "lat": 10.776889,
    "lng": 106.700806
  }
  ```
- **Response (`200 OK`):** Trả về đối tượng `UserProfileResponseDto` tương tự 3.11.1.

---

### 3.12. Quản Lý Bài Đăng Tìm Đối Thủ (Posts & Match Finding)

#### 3.12.1. Tạo bài đăng tìm đối mới (`POST /posts`)
- **Quyền truy cập:** Đã đăng nhập (`active`)
- **Request Body (`CreatePostDto`):**
  ```json
  {
    "title": "Tìm kèo giao lưu 7v7 tối thứ 6 sân Chánh Hưng",
    "content": "Đội mình trình độ trung bình, đá văn minh không va chạm thô bạo. Tiền sân chia 5-5.",
    "playDate": "2026-10-30",
    "startTime": "19:00",
    "endTime": "20:30",
    "skillLevelRequired": "Trung bình khá",
    "maxPlayers": 14,
    "lat": "10.762622",
    "lng": "106.660172",
    "imageUrl": "https://edpwyenilpultbnxfent.supabase.co/storage/v1/object/public/football-pitch-manager/posts/cover.jpg"
  }
  ```
- **Response (`201 Created` - `PostEntity`):**
  ```json
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "userId": "9175df40-fc7c-4d50-b07e-a35417a2eef2",
    "title": "Tìm kèo giao lưu 7v7 tối thứ 6 sân Chánh Hưng",
    "content": "Đội mình trình độ trung bình, đá văn minh không va chạm thô bạo. Tiền sân chia 5-5. (Địa điểm: Sân Chánh Hưng, Q8)",
    "playDate": "2026-10-30",
    "startTime": "19:00:00",
    "endTime": "20:30:00",
    "skillLevelRequired": "Trung bình khá",
    "maxPlayers": 14,
    "imageUrl": "https://edpwyenilpultbnxfent.supabase.co/storage/v1/object/public/football-pitch-manager/posts/cover.jpg",
    "status": "open",
    "lat": "10.762622",
    "lng": "106.660172",
    "createdAt": "2026-10-29T15:30:00.000Z",
    "updatedAt": "2026-10-29T15:30:00.000Z"
  }
  ```

#### 3.12.2. Lấy danh sách bài đăng công khai (`GET /posts`)
- **Quyền truy cập:** Public
- **Query Params:** `page`, `limit`, `search`, `skillLevel`, `playDate`, `status`
- **Response (`200 OK`):** Trả về đối tượng `{ items: PostEntity[], total, page, limit, totalPages }`.

#### 3.12.3. Lấy danh sách bài đăng của tôi (`GET /posts/me`)
- **Quyền truy cập:** Đã đăng nhập (`active`)
- **Query Params:** `page`, `limit`, `status`
- **Response (`200 OK`):** Trả về đối tượng `{ items: PostEntity[], total, page, limit, totalPages }`.

#### 3.12.4. Xem chi tiết bài đăng (`GET /posts/:id`)
- **Quyền truy cập:** Public
- **Response (`200 OK`):** Trả về chi tiết `PostEntity` (bao gồm `imageUrl` và thông tin người đăng `user`).

#### 3.12.5. Cập nhật bài đăng (`PATCH /posts/:id`)
- **Quyền truy cập:** User (Chính chủ bài đăng)
- **Request Body (`UpdatePostDto`):** Tương tự `CreatePostDto` (tất cả các trường tùy chọn, hỗ trợ cập nhật `imageUrl` và `status`).
- **Response (`200 OK`):** Trả về `PostEntity` đã cập nhật.

#### 3.12.6. Xóa bài đăng (`DELETE /posts/:id`)
- **Quyền truy cập:** User (Chính chủ bài đăng)
- **Response (`200 OK`):** `{ "message": "Xóa bài đăng thành công" }`.





### 3.12. Nhóm API Thanh toán & Hoàn tiền (Payment & Refund)

#### 3.12.1. Chọn phương thức thanh toán booking (`POST /bookings/:bookingId/payment-method`)
- **Quyền truy cập:** User (Chính chủ đơn booking)
- **Mô tả:** Khách hàng lựa chọn hình thức thanh toán (`cash` hoặc `vnpay`). Hệ thống khởi tạo bản ghi `transactions` ở trạng thái `pending` với số tiền cọc hoặc tổng tiền.
- **Request Body (`SelectPaymentMethodDto`):**
  ```json
  {
    "method": "cash"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "8f0a0d92-23c2-466d-92a0-4592a407e3d1",
      "userId": "6b6d57a2-19bc-4678-831e-b816a75f0a0e",
      "type": "booking_deposit",
      "refId": "c81d2977-4768-4870-a033-dcc3cca73f4d",
      "amount": "132000.00",
      "status": "pending",
      "gateway": "cash",
      "gatewayRef": null,
      "createdAt": "2026-10-30T10:00:00.000Z",
      "updatedAt": "2026-10-30T10:00:00.000Z"
    }
  }
  ```

#### 3.12.2. Chủ sân xác nhận thu tiền mặt (`POST /owner/bookings/:bookingId/confirm-cash`)
- **Quyền truy cập:** Owner (Chủ cụm sân có đơn) / Admin
- **Mô tả:** Chủ sân xác nhận khách hàng đã thanh toán tiền mặt thành công. Hệ thống cập nhật `transactions.status = 'success'` và `bookings.payment_status = 'paid'`.
- **Request Body (`ConfirmCashPaymentDto`):**
  ```json
  {
    "note": "Khách hàng đã thanh toán đủ tiền mặt tại quầy"
  }
  ```
- **Response (`200 OK`):** Trả về đối tượng `PaymentTransactionResponseDto` với `status: "success"`.

#### 3.12.3. Khởi tạo thanh toán VNPay Sandbox (`POST /payments/vnpay/create-url`)
- **Quyền truy cập:** User đã đăng nhập (`active`)
- **Mô tả:** Tạo link thanh toán VNPay trực tuyến kèm chữ ký số bảo mật HMAC-SHA512.
- **Request Body (`CreateVnpayUrlDto`):**
  ```json
  {
    "bookingId": "c81d2977-4768-4870-a033-dcc3cca73f4d",
    "orderInfo": "Thanh toan tien coc dat san"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=13200000&vnp_Command=pay&vnp_CreateDate=20261030100000&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+tien+coc+dat+san&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fv1%2Fpayments%2Fvnpay%2Freturn&vnp_TmnCode=CGXZLS0Z&vnp_TxnRef=8f0a0d92-23c2-466d-92a0-4592a407e3d1&vnp_Version=2.1.0&vnp_SecureHash=abcdef123456...",
      "txnRef": "8f0a0d92-23c2-466d-92a0-4592a407e3d1"
    }
  }
  ```

#### 3.12.4. Webhook IPN xử lý kết quả thanh toán từ VNPay (`GET /payments/vnpay/ipn`)
- **Quyền truy cập:** Cổng thanh toán VNPay (Server-to-Server, Public)
- **Mô tả:** Webhook nhận thông báo kết quả giao dịch ngầm. Hệ thống kiểm tra checksum HMAC-SHA512, đối soát số tiền `vnp_Amount`, áp dụng cơ chế chống callback lặp (Idempotency). Khi giao dịch thành công (`vnp_ResponseCode = '00'`), tự động cập nhật `bookings.payment_status = 'paid'`.
- **Response (`200 OK` - Chuẩn VNPay):**
  ```json
  {
    "success": true,
    "data": {
      "RspCode": "00",
      "Message": "Confirm Success"
    }
  }
  ```
  *(Trường hợp callback lặp: trả về `RspCode: "02" - Order already confirmed` mà không xử lý lại)*.

#### 3.12.5. Trang điều hướng kết quả thanh toán VNPay (`GET /payments/vnpay/return`)
- **Quyền truy cập:** Public
- **Mô tả:** Nhận redirect người dùng về từ trang thanh toán VNPay, xác thực chữ ký và cung cấp tóm tắt trạng thái giao dịch cho giao diện.
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "isValid": true,
      "isSuccess": true,
      "txnRef": "8f0a0d92-23c2-466d-92a0-4592a407e3d1",
      "transactionNo": "14598201",
      "amount": 132000,
      "bankCode": "NCB",
      "message": "Giao dịch thành công"
    }
  }
  ```

#### 3.12.6. Hoàn tiền giao dịch booking (`POST /payments/bookings/:bookingId/refund`)
- **Quyền truy cập:** Owner (Chủ cụm sân có đơn) / Admin
- **Mô tả:** Xử lý hoàn tiền cho các đơn booking đã thanh toán (`payment_status = 'paid'`) nhưng bị hủy hoặc từ chối. Hệ thống tạo một bản ghi `transactions` mới có `type = 'refund'` và chuyển trạng thái `bookings.payment_status = 'refunded'`.
- **Request Body (`RefundPaymentDto`):**
  ```json
  {
    "amount": 132000,
    "reason": "Chủ sân hủy do thời tiết mưa bão sân ngập nước"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "refundTransactionId": "a1b2c3d4-e5f6-4789-90ab-cdef12345678",
      "bookingId": "c81d2977-4768-4870-a033-dcc3cca73f4d",
      "refundAmount": "132000.00",
      "paymentStatus": "refunded",
      "transactionStatus": "success",
      "reason": "Chủ sân hủy do thời tiết mưa bão sân ngập nước",
      "createdAt": "2026-10-30T10:15:00.000Z"
    }
  }
  ```

---

### 3.13. Đánh Giá Sân Bóng & Xếp Hạng Bayesian (Field Reviews & Rankings)

#### 3.13.1. Đánh giá sân bóng (`POST /reviews/fields`)
- **Quyền truy cập:** Người dùng đã đăng nhập (Chủ đơn đặt sân).
- **Mô tả:** Đánh giá chất lượng sân bóng sau khi đơn đặt sân đã hoàn thành (`status = 'completed'`). Mỗi booking chỉ được đánh giá 1 lần. Hệ thống tự động tính toán lại điểm trung bình và điểm xếp hạng Bayesian (`bayesianScore`).
- **Request Body (`CreateFieldReviewDto`):**
  ```json
  {
    "bookingId": "123e4567-e89b-42d3-a456-426614174000",
    "rating": 5,
    "comment": "Mặt sân cỏ rất đẹp, hệ thống chiếu sáng tốt và nhân viên nhiệt tình."
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "123e4567-e89b-42d3-a456-426614174001",
      "fieldId": "123e4567-e89b-42d3-a456-426614174002",
      "reviewerId": "123e4567-e89b-42d3-a456-426614174003",
      "bookingId": "123e4567-e89b-42d3-a456-426614174000",
      "rating": 5,
      "comment": "Mặt sân cỏ rất đẹp, hệ thống chiếu sáng tốt và nhân viên nhiệt tình.",
      "isFlagged": false,
      "flagReason": null,
      "createdAt": "2026-10-31T10:00:00.000Z"
    }
  }
  ```

#### 3.13.2. Lấy danh sách đánh giá của sân bóng (`GET /reviews/fields/:fieldId`)
- **Quyền truy cập:** Public
- **Query Params:** `page` (mặc định: 1), `limit` (mặc định: 10), `rating` (lọc theo số sao 1-5).
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "data": [
        {
          "id": "123e4567-e89b-42d3-a456-426614174001",
          "rating": 5,
          "comment": "Sân đẹp",
          "createdAt": "2026-10-31T10:00:00.000Z",
          "reviewer": {
            "id": "123e4567-e89b-42d3-a456-426614174003",
            "username": "nguyenvana",
            "fullName": "Nguyen Van A"
          }
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 10
    }
  }
  ```

#### 3.13.3. Xem tóm tắt điểm Bayesian của sân (`GET /reviews/fields/:fieldId/summary`)
- **Quyền truy cập:** Public
- **Mô tả:** Lấy điểm trung bình `avgRating`, tổng số lượt đánh giá `totalReviews`, và điểm xếp hạng Bayesian trọng số `bayesianScore` theo công thức: `(C * M + totalReviews * avgRating) / (C + totalReviews)` với `C = 5, M = 3.5`.
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "avgRating": "4.85",
      "totalReviews": 20,
      "bayesianScore": "4.680"
    }
  }
  ```

#### 3.13.4. Bảng xếp hạng top sân bóng theo điểm Bayesian (`GET /fields/rankings/top`)
- **Quyền truy cập:** Public
- **Query Params:** `limit` (mặc định: 10, tối đa: 50).
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "fieldId": "123e4567-e89b-42d3-a456-426614174002",
        "name": "Sân Bóng Chánh Hưng",
        "address": "123 Phạm Hùng",
        "district": "Quận 8",
        "avgRating": "4.85",
        "totalReviews": 20,
        "bayesianScore": "4.680"
      }
    ]
  }
  ```

---

### 3.14. Đánh Giá Người Chơi & Tinh Thần Thể Thao (User Reviews & Sportsmanship)

#### 3.14.1. Đánh giá người chơi cùng trận (`POST /reviews/users`)
- **Quyền truy cập:** Người dùng đã đăng nhập (Cùng tham gia trong trận đấu của post).
- **Mô tả:** Đánh giá tinh thần thể thao (fair-play) của đối thủ hoặc đồng đội sau trận đấu. Yêu cầu cả người đánh giá và người được đánh giá đều là người tạo bài đăng hoặc người ứng tuyển đã được chấp nhận (`status = 'accepted'`).
- **Request Body (`CreateUserReviewDto`):**
  ```json
  {
    "targetUserId": "123e4567-e89b-42d3-a456-426614174003",
    "postId": "123e4567-e89b-42d3-a456-426614174004",
    "rating": 5,
    "comment": "Đá nhiệt tình, đúng giờ và rất fair-play."
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "123e4567-e89b-42d3-a456-426614174010",
      "targetUserId": "123e4567-e89b-42d3-a456-426614174003",
      "reviewerId": "123e4567-e89b-42d3-a456-426614174099",
      "postId": "123e4567-e89b-42d3-a456-426614174004",
      "rating": 5,
      "comment": "Đá nhiệt tình, đúng giờ và rất fair-play.",
      "createdAt": "2026-10-31T10:00:00.000Z"
    }
  }
  ```

#### 3.14.2. Xem điểm uy tín thể thao của người chơi (`GET /reviews/users/:userId/summary`)
- **Quyền truy cập:** Public
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "avgRating": "4.90",
      "totalReviews": 10,
      "sportsmanshipScore": "4.65"
    }
  }
  ```

---

### 3.15. Kiểm Duyệt Đánh Giá (Review Moderation)

#### 3.15.1. Báo cáo đánh giá sân bóng (`POST /reviews/fields/:id/report`)
- **Quyền truy cập:** Đã đăng nhập
- **Request Body (`ReportReviewDto`):**
  ```json
  {
    "reason": "Nội dung nhận xét chứa từ ngữ xúc phạm hoặc thông tin sai sự thật"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "123e4567-e89b-42d3-a456-426614174001",
      "isFlagged": true,
      "flagReason": "Nội dung nhận xét chứa từ ngữ xúc phạm hoặc thông tin sai sự thật"
    }
  }
  ```

#### 3.15.2. Quản trị viên xử lý kiểm duyệt đánh giá sân (`PATCH /reviews/fields/:id/moderate`)
- **Quyền truy cập:** Admin
- **Mô tả:** Admin chọn hành động `dismiss` (bỏ qua báo cáo, đánh giá trở lại bình thường) hoặc `hide` (ẩn đánh giá khỏi trang và tự động loại trừ khỏi tính toán điểm Bayesian).
- **Request Body (`ModerateReviewDto`):**
  ```json
  {
    "action": "hide",
    "reason": "Đánh giá vi phạm tiêu chuẩn cộng đồng"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "123e4567-e89b-42d3-a456-426614174001",
      "isFlagged": true,
      "flagReason": "HIDDEN: Đánh giá vi phạm tiêu chuẩn cộng đồng"
    }
  }
  ```

---

### 3.16. Gói Thành Viên & Đăng Ký Dịch Vụ (Subscription Plans & Lifecycle)

#### 3.16.1. Admin tạo gói dịch vụ mới (`POST /subscription-plans`)
- **Quyền truy cập:** Admin
- **Request Body (`CreateSubscriptionPlanDto`):**
  ```json
  {
    "name": "Gói Hội Viên Vàng",
    "price": 299000,
    "durationDays": 30,
    "benefit": {
      "aiQuotaDaily": 50,
      "featuredField": true
    },
    "isActive": true
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "123e4567-e89b-42d3-a456-426614174020",
      "name": "Gói Hội Viên Vàng",
      "price": "299000.00",
      "durationDays": 30,
      "benefit": {
        "aiQuotaDaily": 50,
        "featuredField": true
      },
      "isActive": true,
      "createdAt": "2026-10-31T10:00:00.000Z"
    }
  }
  ```

#### 3.16.2. Lấy danh sách gói thành viên đang mở đăng ký (`GET /subscription-plans`)
- **Quyền truy cập:** Public
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "123e4567-e89b-42d3-a456-426614174020",
        "name": "Gói Hội Viên Vàng",
        "price": "299000.00",
        "durationDays": 30,
        "benefit": { "aiQuotaDaily": 50 }
      }
    ]
  }
  ```

#### 3.16.3. Đăng ký gói thành viên (`POST /subscriptions`)
- **Quyền truy cập:** Đã đăng nhập
- **Mô tả:** Đăng ký gói dịch vụ. Hệ thống kiểm tra tài khoản chưa có gói đang active, tự động tính `startDate` và `endDate = startDate + durationDays`.
- **Request Body (`SubscribePlanDto`):**
  ```json
  {
    "planId": "123e4567-e89b-42d3-a456-426614174020"
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "123e4567-e89b-42d3-a456-426614174021",
      "ownerId": "123e4567-e89b-42d3-a456-426614174099",
      "planId": "123e4567-e89b-42d3-a456-426614174020",
      "status": "active",
      "startDate": "2026-10-31",
      "endDate": "2026-11-30",
      "createdAt": "2026-10-31T10:00:00.000Z"
    }
  }
  ```

#### 3.16.4. Xem gói thành viên của bản thân (`GET /subscriptions/me`)
- **Quyền truy cập:** Đã đăng nhập
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "123e4567-e89b-42d3-a456-426614174021",
      "status": "active",
      "startDate": "2026-10-31",
      "endDate": "2026-11-30",
      "plan": {
        "name": "Gói Hội Viên Vàng",
        "benefit": { "aiQuotaDaily": 50 }
      }
    }
  }
  ```

#### 3.16.5. Hủy gói thành viên (`DELETE /subscriptions/:id`)
- **Quyền truy cập:** Chủ sở hữu gói
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "123e4567-e89b-42d3-a456-426614174021",
      "status": "cancelled"
    }
  }
  ```

---

### 3.17. Trợ Lý AI & Quản Lý Hạn Mức (AI Assistant & Quota Tracking)

#### 3.17.1. Gợi ý ghép trận thông minh bằng AI (`POST /ai/matchmaking/suggestions`)
- **Quyền truy cập:** Đã đăng nhập (Áp dụng `AiRateLimitGuard`, trả về `429 Too Many Requests` nếu vượt quá hạn mức hàng ngày của gói).
- **Mô tả:** Phân tích ứng viên đang chờ duyệt (`pending`) của bài đăng tìm đối, đối chiếu điểm tinh thần thể thao (`sportsmanshipScore`) và lịch sử tham gia để đề xuất người chơi có độ tương thích cao nhất.
- **Request Body (`AiMatchSuggestionRequestDto`):**
  ```json
  {
    "postId": "123e4567-e89b-42d3-a456-426614174004"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "postId": "123e4567-e89b-42d3-a456-426614174004",
      "recommendedUserId": "123e4567-e89b-42d3-a456-426614174003",
      "compatibilityScore": 92,
      "reason": "Người chơi có điểm tinh thần thể thao 4.8/5.0 và đã hoàn thành 10 đánh giá trận đấu, phù hợp tiêu chí bài đăng.",
      "tokensUsed": 120,
      "provider": "mock"
    }
  }
  ```

#### 3.17.2. Xem hạn mức AI và số lượt đã sử dụng (`GET /ai/usage/me`)
- **Quyền truy cập:** Đã đăng nhập
- **Mô tả:** Lấy số lượt yêu cầu AI đã sử dụng trong ngày hôm nay, hạn mức theo gói (mặc định Free: 3/ngày, Pro/VIP: 50+/ngày), và số lượt còn lại.
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "dailyRequestsUsed": 2,
      "dailyQuota": 50,
      "remainingRequests": 48,
      "totalTokensUsed": 240
    }
  }
  ```

---

### 3.18. Bảng Xếp Hạng & Leaderboards

#### 3.18.1. Bảng xếp hạng Top sân bóng uy tín (`GET /rankings/fields`)
- **Quyền truy cập:** Public
- **Query Params:** `limit` (mặc định 20).
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "rank": 1,
        "fieldId": "f7a6b5c4-1234-5678-90ab-cdef12345678",
        "name": "Sân Bóng Chánh Hưng",
        "address": "18 Nguyễn Lương Bằng, Tân Phú",
        "district": "Quận 7",
        "avgRating": 4.9,
        "totalReviews": 128,
        "bayesianScore": 4.88,
        "thumbnailUrl": "https://example.com/pitch.jpg"
      }
    ]
  }
  ```

#### 3.18.2. Bảng xếp hạng Top người chơi thể thao gương mẫu (`GET /rankings/players`)
- **Quyền truy cập:** Public
- **Query Params:** `limit` (mặc định 20).
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "rank": 1,
        "userId": "u1a2b3c4-5678-90ab-cdef-1234567890ab",
        "name": "Alex Mercer",
        "avatarUrl": "https://example.com/avatar.jpg",
        "skillLevel": "Bán chuyên",
        "avgRating": 4.95,
        "totalReviews": 42,
        "sportsmanshipScore": 99.0
      }
    ]
  }
  ```

---

### 3.19. Quản Lý Hệ Thống & Kiểm Duyệt (`AdminManagementModule` — `ADMIN-USER`, `ADMIN-POST`, `ADMIN-REV`)

#### 3.19.1. Danh sách người dùng toàn hệ thống (`GET /admin/users`)
- **Quyền truy cập:** `admin` (`JwtAuthGuard`, `AccountStatusGuard`, `RolesGuard`)
- **Query Parameters (`AdminUsersQueryDto`):**
  - `search` (tùy chọn): Tìm theo `full_name`, `email`, hoặc `phone`.
  - `role` (tùy chọn): `'all' | 'user' | 'owner' | 'admin'` (mặc định `'all'`).
  - `status` (tùy chọn): `'all' | 'active' | 'suspended' | 'inactive' | 'pending_verification'` (mặc định `'all'`).
  - `page` (mặc định `1`), `limit` (mặc định `10`, tối đa `50`).
- **Response (`200 OK` - `AdminUsersListResponseDto`):**
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "fullName": "Nguyễn Minh Quân",
        "email": "quan.nguyen@gmail.com",
        "phone": "0901234567",
        "avatarUrl": null,
        "role": "user",
        "status": "active",
        "reportsCount": 1,
        "createdAt": "2026-08-12T08:30:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 125,
      "totalPages": 13
    },
    "summary": {
      "totalUsers": 125,
      "activeUsers": 118,
      "suspendedUsers": 7,
      "flaggedUsers": 4
    }
  }
  ```

#### 3.19.2. Chi tiết hồ sơ & thống kê người dùng (`GET /admin/users/:id`)
- **Quyền truy cập:** `admin`
- **Response (`200 OK` - `AdminUserDetailResponseDto`):**
  ```json
  {
    "id": "uuid",
    "fullName": "Nguyễn Minh Quân",
    "email": "quan.nguyen@gmail.com",
    "phone": "0901234567",
    "avatarUrl": null,
    "bio": "Đội trưởng FC Bình Thạnh",
    "skillLevel": "intermediate",
    "preferredPositions": ["CM", "CB"],
    "reliabilityScore": 98.5,
    "role": "user",
    "status": "active",
    "reportsCount": 1,
    "stats": {
      "bookingsCount": 14,
      "fieldsCount": 0,
      "postsCount": 3
    },
    "createdAt": "2026-08-12T08:30:00.000Z",
    "updatedAt": "2026-10-01T10:00:00.000Z"
  }
  ```

#### 3.19.3. Khóa / Mở khóa tài khoản người dùng (`PATCH /admin/users/:id/status`)
- **Quyền truy cập:** `admin`
- **Request Body (`UpdateUserStatusDto`):**
  ```json
  {
    "status": "suspended",
    "reason": "Tài khoản phát tán spam bài đăng tìm đối"
  }
  ```
- **Quy tắc nghiệp vụ:**
  - Chặn Admin tự khóa tài khoản của chính mình (`400 Bad Request - ADMIN_CANNOT_SUSPEND_SELF`).
  - Khi `status = 'suspended'`, tự động thu hồi toàn bộ phiên đăng nhập đang hoạt động (`auth_sessions`) trong cùng một transaction.
- **Response (`200 OK` - `AdminUserItemDto`)**

#### 3.19.4. Danh sách bài đăng cộng đồng cho Admin (`GET /admin/posts`)
- **Quyền truy cập:** `admin`
- **Query Parameters (`AdminPostsQueryDto`):** `search`, `status` (`'all' | 'open' | 'matched' | 'closed'`), `page`, `limit`.
- **Response (`200 OK` - `AdminPostsListResponseDto`):** Trả về `items`, `meta`, và `summary` (`totalPosts`, `openPosts`, `matchedPosts`, `closedPosts`).

#### 3.19.5. Gỡ / đóng bài đăng vi phạm (`DELETE /admin/posts/:id`)
- **Quyền truy cập:** `admin`
- **Response (`200 OK` - `AdminDeletePostResponseDto`):**
  ```json
  {
    "id": "uuid",
    "status": "closed",
    "deletedAt": "2026-11-06T10:30:00.000Z"
  }
  ```

#### 3.19.6. Danh sách kiểm duyệt đánh giá bị báo cáo (`GET /admin/reviews`)
- **Quyền truy cập:** `admin`
- **Query Parameters (`AdminReviewsQueryDto`):** `search`, `status` (`'all' | 'pending' | 'resolved'`), `reviewType` (`'all' | 'field' | 'user'`), `page`, `limit`.
- **Response (`200 OK` - `AdminReviewsListResponseDto`):** Hợp nhất (`UNION ALL`) các đánh giá có `is_flagged = true` từ `field_reviews` và `user_reviews`, kèm `summary` (`totalFlagged`, `pendingCount`, `resolvedCount`).


