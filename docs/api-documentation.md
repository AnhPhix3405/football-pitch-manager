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
| **Hồ sơ & Đăng ký chủ sân** | `POST` | `/owner-registration` | User / Active | Gửi đơn đăng ký trở thành chủ sân |
| | `GET` | `/owner-registration/status` | User / Active | Kiểm tra tiến trình phê duyệt hồ sơ chủ sân |
| | `GET` | `/owner-profiles/me` | User / Active | Lấy hồ sơ chủ sân của tài khoản hiện tại |
| | `PATCH` | `/owner-profiles/me` | User / Active | Cập nhật hồ sơ chủ sân của tài khoản hiện tại |
| | `GET` | `/owner-profiles/:id` | Public | Xem hồ sơ công khai của một chủ sân |
| **Phê duyệt quản trị (Admin)**| `GET` | `/admin/owner-approvals` | Admin | Lấy danh sách hồ sơ đăng ký chủ sân cần duyệt |
| | `GET` | `/admin/owner-approvals/:id` | Admin | Xem chi tiết hồ sơ đăng ký chủ sân |
| | `POST` | `/admin/owner-approvals/:id/approve` | Admin | Phê duyệt hồ sơ đăng ký chủ sân |
| | `POST` | `/admin/owner-approvals/:id/reject` | Admin | Từ chối hồ sơ đăng ký chủ sân |
| | `GET` | `/admin/field-approvals` | Admin | Lấy danh sách yêu cầu duyệt sân bóng |
| | `GET` | `/admin/field-approvals/:id` | Admin | Xem chi tiết yêu cầu duyệt sân bóng |
| | `POST` | `/admin/field-approvals/:id/approve` | Admin | Phê duyệt sân bóng |
| | `POST` | `/admin/field-approvals/:id/reject` | Admin | Từ chối phê duyệt sân bóng |
| **Hệ thống** | `GET` | `/` | Public | Kiểm tra tình trạng hoạt động backend (Health check) |
| **Real-time Chat** | `WS` | `/chat` | Đã đăng nhập (JWT) | WebSocket Gateway nhắn tin trực tiếp |

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
- **Response (`200 OK`):** Đối tượng `PostMatchEntity` với `status: "accepted"`, bài đăng tự động chuyển `status: "matched"`.

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

### 3.4. Hồ Sơ & Đăng Ký Chủ Sân (Owner Profile & Registration)

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

### 3.5. Phê Duyệt Quản Trị (Admin Approvals)

#### 3.5.1. Lấy danh sách duyệt hồ sơ chủ sân (`GET /admin/owner-approvals`)
- **Quyền truy cập:** `admin` (Active)
- **Query Parameters (`AdminOwnerApprovalQueryDto`):**
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
| `send_message` | `{"conversationId": "uuid", "content": "string", "messageType": "text"}` | Gửi tin nhắn mới |
| `mark_as_delivered` | `{"conversationId": "uuid"}` | Đánh dấu tin nhắn đã được nhận |
| `mark_as_read` | `{"conversationId": "uuid"}` | Đánh dấu tin nhắn đã được đọc |
| `edit_message` | `{"messageId": "uuid", "content": "string"}` | Sửa nội dung tin nhắn đã gửi |
| `delete_message` | `{"messageId": "uuid"}` | Xóa tin nhắn |

#### 3.7.2. Sự kiện Server phát về Client (Emit Events)

| Sự kiện (Event Name) | Dữ liệu phát về (Payload) | Mô tả |
| :--- | :--- | :--- |
| `receive_message` | Đối tượng `Message` đầy đủ | Tin nhắn mới gửi tới phòng chat |
| `message_delivered` | `{"userId": "uuid", "conversationId": "uuid"}` | Thông báo người nhận đã nhận được tin nhắn |
| `message_read` | `{"userId": "uuid", "conversationId": "uuid"}` | Thông báo người nhận đã đọc tin nhắn |
| `message_edited` | Đối tượng `Message` đã cập nhật | Thông báo cập nhật nội dung tin nhắn |
| `message_deleted` | `{"messageId": "uuid", "conversationId": "uuid"}` | Thông báo tin nhắn đã bị xóa khỏi phòng |
