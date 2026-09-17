# AGENTS.md

## 1. Công nghệ sử dụng

- Ngôn ngữ: TypeScript.
- Framework backend: NestJS.
- Database: PostgreSQL.
- ORM và migration: TypeORM.
- Cache và rate limiting: Redis.
- Môi trường chạy: Node.js, Docker, Docker Compose.

## 2. Quy tắc làm việc

- Đọc source, schema và convention hiện tại trước khi đề xuất hoặc sửa code.
- Không đoán tên file, class, entity, column, enum, index, constraint hoặc business rule.
- Thiếu căn cứ thì dừng, ghi rõ nội dung chưa xác minh và hỏi lại.
- Đánh giá phạm vi ảnh hưởng trước khi sửa.
- Chỉ sửa đúng phạm vi được yêu cầu.
- Không tự refactor hoặc sửa code không liên quan.
- Không viết ví dụ, giải thích dài dòng hoặc lặp lại yêu cầu.
- Ưu tiên bảng và gạch đầu dòng.

## 3. File nhạy cảm

- Được phép đọc `.env` để kiểm tra cấu hình.
- Không hiển thị hoặc sao chép giá trị bí mật trong câu trả lời và log.
- Không tự động sửa:
  - `.env` và file chứa secret.
  - Cấu hình production, deploy và CI/CD.
  - Cấu hình authentication, authorization hoặc security ngoài phạm vi yêu cầu.
  - Migration lịch sử đã chạy.
- Chỉ sửa file nhạy cảm khi có yêu cầu hoặc xác nhận rõ ràng.

## 4. Quy tắc đặt tên

- Tên file mới dùng `kebab-case`.
- Tên migration dùng định dạng `timestamp-kebab-case`.
- Tên class, method, property, table và column phải theo convention hiện có của dự án.
- Không tự đổi tên public API, entity, column hoặc relation.
- Tên phải thể hiện đúng trách nhiệm, không dùng tên chung chung.

## 5. Kiến trúc dự án

- Tuân thủ Clean Architecture và OOP.
- Mỗi tầng chỉ xử lý đúng trách nhiệm của mình.
- Không gọi trực tiếp database từ controller hoặc DTO.
- Không đặt business logic trong controller, repository, entity, helper hoặc utility.
- Dependency chỉ đi qua abstraction phù hợp.

```text
src/
├── components/
│   └── <module>/
│       ├── controllers/
│       ├── dto/
│       └── services/
├── database/
│   ├── config/
│   └── migrations/
├── repositories/
├── entities/
├── core/
├── common/
├── constants/
├── utils/
└── helpers/
```

| Thư mục | Trách nhiệm |
|---|---|
| `components` | Chứa các module nghiệp vụ và luồng xử lý của từng module |
| `controllers` | Nhận request, gọi service, trả response |
| `dto` | Khai báo input/output và validation |
| `services` | Xử lý từng use case nghiệp vụ |
| `database` | Chứa cấu hình database và migration |
| `database/config` | Cấu hình kết nối, DataSource và ORM |
| `database/migrations` | Chứa các TypeORM migration độc lập |
| `repositories` | Truy cập và truy vấn dữ liệu |
| `entities` | Ánh xạ entity và quan hệ database |
| `core` | Base class, interface và abstraction dùng chung |
| `common` | Thành phần dùng chung toàn dự án |
| `constants` | Constant và enum dùng chung |
| `utils` | Hàm kỹ thuật thuần, không chứa business logic |
| `helpers` | Hàm hỗ trợ nhỏ, không truy cập trực tiếp database |

## 6. Quy tắc service và DTO

- Không đặt toàn bộ logic của module trong một service.
- Mỗi chức năng hoặc use case có service riêng.
- Service phải có một trách nhiệm rõ ràng.
- Tách riêng validation nghiệp vụ phức tạp khi cần tái sử dụng.
- Không tạo service đa năng hoặc method quá lớn.
- Transaction phải bao phủ trọn vẹn các thay đổi dữ liệu liên quan.
- Request DTO và response DTO phải nằm trong các file riêng biệt.
- Mỗi DTO chỉ phục vụ một input hoặc output rõ ràng.
- Không gom DTO của nhiều chức năng vào cùng một file.
- Chỉ dùng DTO chung khi cấu trúc và ý nghĩa nghiệp vụ thực sự giống nhau.

## 7. Quy tắc repository và entity

- Repository chỉ chứa logic truy cập dữ liệu.
- Query dùng lại nhiều lần phải được gom vào repository phù hợp.
- Entity không chứa logic điều phối use case.
- Không để ORM model rò rỉ sang tầng không cần biết chi tiết persistence.
- Không tạo duplicate repository, relation, index hoặc constraint.

## 8. Quy tắc migration

- Tất cả migration phải nằm trong `src/database/migrations`.
- Cấu hình database phải nằm trong `src/database/config`.
- Database config chỉ đọc biến môi trường, không hardcode credential.
- Tạo migration mới; không sửa migration lịch sử đã chạy.
- Tên migration phải theo `timestamp-kebab-case` và mô tả đúng thay đổi.
- Kiểm tra entity, column, foreign key, index và constraint hiện tại trước khi viết.
- Ưu tiên bảo toàn dữ liệu.
- Backfill dữ liệu trước khi đặt `NOT NULL` hoặc xóa column cũ.
- `up()` và `down()` phải rõ ràng, an toàn và không chọn dữ liệu ngẫu nhiên.
- Nêu rõ nếu migration không thể rollback dữ liệu một cách xác định.

## 9. Quy trình sửa code

1. Đọc file liên quan và convention hiện tại.
2. Xác định yêu cầu và các điểm chưa đủ căn cứ.
3. Liệt kê file dự kiến sửa và phạm vi ảnh hưởng.
4. Đánh giá ảnh hưởng đến database, API, module và test.
5. Thực hiện thay đổi nhỏ nhất đáp ứng yêu cầu.
6. Chạy test, lint, build hoặc kiểm tra phù hợp.
7. Kiểm tra diff, migration và file ngoài phạm vi.

## 10. Format đầu ra của agent

| Mục | Nội dung bắt buộc |
|---|---|
| Kết quả | Trạng thái hoàn thành hoặc blocker |
| File đã sửa | Danh sách chính xác các file đã thay đổi |
| File bị ảnh hưởng | Các file/module cần kiểm tra nhưng không sửa |
| Ảnh hưởng | Database, API, migration, module và test liên quan |
| Kiểm tra | Lệnh hoặc kiểm tra đã chạy và kết quả |
| Chưa xác minh | Nội dung không đủ căn cứ từ source |

- Trả lời ngắn, đúng trọng tâm.
- Không suy diễn rằng test đã pass nếu chưa chạy.
- Không tuyên bố hoàn thành khi còn lỗi hoặc blocker.
