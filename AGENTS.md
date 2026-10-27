# 1. Nguyên Tắc Suy Luận Và Cung Cấp Thông Tin

- **Không tự suy diễn:** Không đoán mò, không tự đặt ra giả định khi thông tin chưa rõ ràng.
- **Không tự tạo ví dụ/kịch bản:** Chỉ làm việc trên dữ liệu, yêu cầu và ngữ cảnh thực tế được cung cấp.
- **Xác minh thông tin:** Hỏi lại ngay nếu yêu cầu bị thiếu hoặc có điểm chưa rõ, không tự lấp khoảng trống bằng giả định.

# 2. Quy Trình Chỉnh Sửa Code & Lập Kế Hoạch (Planning)

- **Không tự ý sửa code:** Không được phép tự động chỉnh sửa codebase khi chưa có sự đồng ý.
- **Bắt buộc lập plan trước khi làm:** Mọi thao tác sửa đổi đều phải qua bước lập kế hoạch chi tiết.
- **Nội dung Kế hoạch (Plan) phải thể hiện rõ:**
  - Phạm vi thay đổi (Scope of work).
  - Danh sách cụ thể tất cả các file bị ảnh hưởng hoặc cần chỉnh sửa.
  - Tác động dự kiến của thay đổi đối với hệ thống.
- **Luôn ưu tiên sử dụng i18n cho text:** Thêm key và value vào file i18n.ts với ngôn ngữ chính là en, vi
- **Luôn cập nhật tài liệu API:** Mỗi khi thêm mới, sửa đổi hoặc xóa API/WebSocket event, bắt buộc phải cập nhật ngay vào file `docs/api-documentation.md` (bao gồm endpoint, phân loại, payload request và response).

# 3. Quy Định Về Cơ Sở Dữ Liệu (Database)

- **Tuyệt đối không tự ý thao tác DB:** Không tự chạy migration, không sửa schema, không thêm/xóa/sửa dữ liệu trực tiếp.
- **Đề xuất thay đổi DB:** Mọi thay đổi liên quan đến DB phải được mô tả chi tiết trong Plan và chờ xác nhận trước khi thực thi.

# 4. Định Dạng Phản Hồi

- **Ưu tiên gạch đầu dòng:** Trình bày tất cả câu trả lời, phân tích, đề xuất dưới dạng danh sách gạch đầu dòng ngắn gọn.
- **Tập trung vào trọng tâm:** Tránh viết đoạn văn dài dòng, đi thẳng vào bản chất vấn đề.

# 5. Nguyên tắc trước khi trả kết quả

- **Luôn chạy build và ESLint:** Bắt buộc thực thi lệnh kiểm tra lỗi cú pháp (lint) và biên dịch (build) sau khi hoàn tất chỉnh sửa code. 
- **Báo cáo trạng thái kiểm tra:** Đính kèm kết quả chạy build và ESLint ngắn gọn trong phản hồi cuối cùng để xác nhận chất lượng code.

# 6. Quy tắc cách tổ chức code

- **Logic phải được xử lí độc lập:** Các function hoặc logic phức tạp cần phải được tách ra thành các function riêng biệt, không được nhét logic vào components.
- **Thư mục components chỉ chứa các UI chung nhất**
- **Giao tiếp với api cần tạo hooks riêng trong thư mục src/hooks:** Không nhét logic gọi api vào chung với giao diện
- **Trong features tạo folder riêng cho mỗi lớp xử lí:** Ví dụ features/posts/interface, features/posts/service,
- **Khai báo types/constants độc lập:** Tuyệt đối không khai báo type, enum, code phân loại hoặc constant trực tiếp trong file UI/components; tất cả phải được khai báo trong thư mục `constants` (hoặc `interface`) để giữ component thuần UI, dễ bảo trì và đồng bộ với Backend.