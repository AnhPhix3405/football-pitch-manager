# Database Specification

## 1. Mục đích

- Nguồn chuẩn để agent tạo TypeORM migration và entity.
- Database: PostgreSQL.
- Dự án và database được tạo mới hoàn toàn.
- Kiểu thời gian hệ thống đã chốt: `timestamptz`.
- UUID do backend tạo bằng thư viện UUID v4; database không tự sinh UUID.
- Tiền tệ duy nhất: VND; không tạo column `currency`.
- `varchar` không giới hạn độ dài nếu bảng không ghi khác.
- Dữ liệu JSON dùng kiểu `json`.
- Không tự thêm bảng, column, enum, index, constraint hoặc quan hệ ngoài file này.
- Nếu source hiện tại khác file này, phải báo khác biệt trước khi sửa.

## 2. Quy tắc migration

- Tên file: `{timestamp}-create-tbl-{table-name}.ts`.
- Mỗi migration chỉ tạo một bảng.
- Không nhét nhiều bảng vào cùng một migration.
- Migration tạo theo đúng thứ tự dependency tại mục 3.
- Index và foreign key của bảng nằm trong migration tạo bảng đó.
- `down()` chỉ rollback phạm vi của migration tương ứng.
- Không sửa migration lịch sử đã chạy.
- Không đặt default UUID trong migration.
- Tên constraint và index để TypeORM tự sinh.
- Các enum trong tài liệu được lưu bằng `varchar`; validation enum thực hiện theo convention dự án.
- Không tạo foreign key cho quan hệ polymorphic.
- Không tạo duplicate index.
- Các mốc thời gian hệ thống dùng `timestamptz` và lưu theo UTC.
- Không dùng `timestamp without time zone` cho mốc thời gian hệ thống.
- Ngày và giờ lịch sân dùng `date` và `time`, không chuyển sang `timestamptz`.

## 3. Danh sách migration

| Thứ tự | Tên migration |
|---:|---|
| 1 | `{timestamp}-create-tbl-users.ts` |
| 2 | `{timestamp}-create-tbl-user-profiles.ts` |
| 3 | `{timestamp}-create-tbl-owner-profiles.ts` |
| 4 | `{timestamp}-create-tbl-fields.ts` |
| 5 | `{timestamp}-create-tbl-field-courts.ts` |
| 6 | `{timestamp}-create-tbl-field-images.ts` |
| 7 | `{timestamp}-create-tbl-field-services.ts` |
| 8 | `{timestamp}-create-tbl-field-pricing.ts` |
| 9 | `{timestamp}-create-tbl-field-opening-hours.ts` |
| 10 | `{timestamp}-create-tbl-field-blocked-slots.ts` |
| 11 | `{timestamp}-create-tbl-bookings.ts` |
| 12 | `{timestamp}-create-tbl-booking-services.ts` |
| 13 | `{timestamp}-create-tbl-posts.ts` |
| 14 | `{timestamp}-create-tbl-post-comments.ts` |
| 15 | `{timestamp}-create-tbl-conversations.ts` |
| 16 | `{timestamp}-create-tbl-post-matches.ts` |
| 17 | `{timestamp}-create-tbl-conversation-members.ts` |
| 18 | `{timestamp}-create-tbl-messages.ts` |
| 19 | `{timestamp}-create-tbl-notifications.ts` |
| 20 | `{timestamp}-create-tbl-subscription-plans.ts` |
| 21 | `{timestamp}-create-tbl-subscriptions.ts` |
| 22 | `{timestamp}-create-tbl-transactions.ts` |
| 23 | `{timestamp}-create-tbl-approval-requests.ts` |
| 24 | `{timestamp}-create-tbl-field-reviews.ts` |
| 25 | `{timestamp}-create-tbl-user-reviews.ts` |
| 26 | `{timestamp}-create-tbl-field-rating-summary.ts` |
| 27 | `{timestamp}-create-tbl-user-rating-summary.ts` |
| 28 | `{timestamp}-create-tbl-ai-usage-logs.ts` |

## 4. Schema chuẩn

```dbml
Table users {
  id uuid [pk]
  email varchar [unique, not null]
  phone varchar [unique]
  password_hash varchar
  auth_provider varchar [not null, default: 'local', note: 'local, google']
  provider_id varchar
  role varchar [not null, default: 'user', note: 'user, owner, admin']
  status varchar [not null, default: 'active', note: 'active, banned, pending']
  lat decimal(10,7)
  lng decimal(10,7)
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (auth_provider, provider_id) [unique]
    role
    status
  }
}

Table user_profiles {
  id uuid [pk]
  user_id uuid [unique, not null]
  full_name varchar
  avatar_url varchar
  bio text
  skill_level varchar [note: 'beginner, intermediate, advanced']
  birthday date
  gender varchar
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
}

Table owner_profiles {
  id uuid [pk]
  user_id uuid [unique, not null]
  business_name varchar
  business_license varchar
  bank_account varchar
  verified_at timestamptz
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
}

Table fields {
  id uuid [pk]
  owner_id uuid [not null]
  name varchar [not null]
  address varchar [not null]
  district varchar
  lat decimal(10,7)
  lng decimal(10,7)
  description text
  status varchar [not null, default: 'pending', note: 'pending, active, hidden, rejected']
  require_deposit boolean [not null, default: false]
  deposit_type varchar [note: 'percentage, fixed_amount']
  deposit_value decimal(15,2)
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    owner_id
    status
    district
    (lat, lng)
  }
}

Table field_courts {
  id uuid [pk]
  field_id uuid [not null]
  name varchar [not null]
  type varchar [not null, note: '5, 7, 11']
  status varchar [not null, default: 'active', note: 'active, maintenance, inactive']
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    field_id
    (field_id, status)
  }
}

Table field_images {
  id uuid [pk]
  field_id uuid [not null]
  url varchar [not null]
  is_thumbnail boolean [not null, default: false]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    field_id
  }
}

Table field_services {
  id uuid [pk]
  field_id uuid [not null]
  name varchar [not null]
  price decimal(15,2) [not null]
  unit varchar
  is_active boolean [not null, default: true]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    field_id
    (field_id, is_active)
  }
}

Table field_pricing {
  id uuid [pk]
  field_id uuid [not null]
  court_type varchar [not null, note: '5, 7, 11']
  day_type varchar [not null, note: 'weekday, weekend']
  start_time time [not null]
  end_time time [not null]
  price decimal(15,2) [not null]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (field_id, court_type, day_type)
    (field_id, court_type, day_type, start_time, end_time)
  }
}

Table field_opening_hours {
  id uuid [pk]
  field_id uuid [not null]
  day_of_week int [not null, note: '1 = Monday, 7 = Sunday']
  open_time time
  close_time time
  is_closed boolean [not null, default: false]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (field_id, day_of_week) [unique]
  }
}

Table field_blocked_slots {
  id uuid [pk]
  field_court_id uuid [not null]
  blocked_date date [not null]
  start_time time [not null]
  end_time time [not null]
  reason varchar
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    field_court_id
    (field_court_id, blocked_date)
    (field_court_id, blocked_date, start_time, end_time)
  }
}

Table bookings {
  id uuid [pk]
  user_id uuid [not null]
  field_id uuid [not null]
  requested_court_type varchar [not null, note: '5, 7, 11']
  field_court_id uuid [note: 'nullable; owner assigns when confirming']
  booking_date date [not null]
  start_time time [not null]
  end_time time [not null]
  status varchar [not null, default: 'pending', note: 'pending, confirmed, rejected, cancelled, completed']
  total_price decimal(15,2) [not null]
  payment_method varchar [note: 'cash, vnpay']
  payment_status varchar [not null, default: 'unpaid', note: 'unpaid, pending, paid, refunded, failed']
  deposit_amount decimal(15,2) [default: 0]
  owner_note text
  cancelled_by uuid
  cancel_reason text
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    user_id
    field_id
    field_court_id
    booking_date
    status
    (user_id, created_at)
    (field_id, booking_date)
    (field_court_id, booking_date)
    (field_court_id, booking_date, start_time, end_time)
  }
}

Table booking_services {
  id uuid [pk]
  booking_id uuid [not null]
  service_id uuid [not null]
  quantity int [not null, default: 1]
  price_snapshot decimal(15,2) [not null]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (booking_id, service_id) [unique]
    booking_id
  }
}

Table posts {
  id uuid [pk]
  user_id uuid [not null]
  title varchar [not null]
  content text
  lat decimal(10,7)
  lng decimal(10,7)
  play_date date [not null]
  start_time time [not null]
  end_time time
  skill_level_required varchar [note: 'beginner, intermediate, advanced']
  max_players int [not null]
  status varchar [not null, default: 'open', note: 'open, matched, closed']
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  deleted_at timestamptz

  indexes {
    user_id
    status
    play_date
    deleted_at
    (status, created_at)
    (status, play_date)
    (lat, lng)
  }
}

Table post_comments {
  id uuid [pk]
  post_id uuid [not null]
  user_id uuid [not null]
  content text [not null]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    post_id
    user_id
    (post_id, created_at)
  }
}

Table conversations {
  id uuid [pk]
  type varchar [not null, default: 'direct', note: 'direct']
  related_post_id uuid
  related_field_id uuid
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    related_post_id
    related_field_id
  }
}

Table post_matches {
  id uuid [pk]
  post_id uuid [not null]
  applicant_id uuid [not null]
  status varchar [not null, default: 'pending', note: 'pending, accepted, rejected']
  conversation_id uuid
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (post_id, applicant_id) [unique]
    post_id
    applicant_id
    (post_id, status)
  }
}

Table conversation_members {
  conversation_id uuid [not null]
  user_id uuid [not null]
  joined_at timestamptz [not null, default: `now()`]
  deleted_at timestamptz
  last_read_at timestamptz

  indexes {
    (conversation_id, user_id) [pk]
    user_id
    (user_id, deleted_at)
  }
}

Table messages {
  id uuid [pk]
  conversation_id uuid [not null]
  sender_id uuid [not null]
  content text
  message_type varchar [not null, default: 'text', note: 'text, image']
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    conversation_id
    sender_id
    (conversation_id, created_at)
  }
}

Table notifications {
  id uuid [pk]
  user_id uuid [not null]
  type varchar [not null, note: 'booking_confirmed, booking_rejected, booking_cancelled, match_accepted, subscription_expiring, new_message']
  title varchar [not null]
  content text
  ref_id uuid
  is_read boolean [not null, default: false]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    user_id
    (user_id, is_read)
    (user_id, created_at)
    (user_id, is_read, created_at)
  }
}

Table subscription_plans {
  id uuid [pk]
  name varchar [not null]
  price decimal(15,2) [not null]
  duration_days int [not null]
  benefit json
  is_active boolean [not null, default: true]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
}

Table subscriptions {
  id uuid [pk]
  owner_id uuid [not null]
  plan_id uuid [not null]
  status varchar [not null, default: 'pending_payment', note: 'active, expired, pending_payment, cancelled']
  start_date date
  end_date date
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    owner_id
    plan_id
    status
    (owner_id, status)
    (status, end_date)
  }
}

Table transactions {
  id uuid [pk]
  user_id uuid [not null]
  type varchar [not null, note: 'subscription, booking_deposit']
  ref_id uuid [not null]
  amount decimal(15,2) [not null]
  status varchar [not null, default: 'pending', note: 'pending, success, failed, refunded']
  gateway varchar
  gateway_ref varchar
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    user_id
    ref_id
    status
    gateway_ref
    (user_id, created_at)
    (type, ref_id)
  }
}

Table approval_requests {
  id uuid [pk]
  type varchar [not null, note: 'owner_register, field_create, field_update']
  target_id uuid [not null]
  requested_by uuid [not null]
  status varchar [not null, default: 'pending', note: 'pending, approved, rejected']
  reviewed_by uuid
  note text
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  reviewed_at timestamptz

  indexes {
    requested_by
    reviewed_by
    status
    (type, target_id)
    (status, created_at)
  }
}

Table field_reviews {
  id uuid [pk]
  field_id uuid [not null]
  reviewer_id uuid [not null]
  booking_id uuid [not null]
  rating int [not null, note: '1-5']
  comment text
  is_flagged boolean [not null, default: false]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (booking_id, reviewer_id) [unique]
    field_id
    reviewer_id
    (field_id, created_at)
  }
}

Table user_reviews {
  id uuid [pk]
  target_user_id uuid [not null]
  reviewer_id uuid [not null]
  post_id uuid [not null]
  rating int [not null, note: '1-5']
  comment text
  is_flagged boolean [not null, default: false]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    (post_id, target_user_id, reviewer_id) [unique]
    target_user_id
    reviewer_id
    (target_user_id, created_at)
  }
}

Table field_rating_summary {
  field_id uuid [pk]
  avg_rating decimal(3,2) [not null, default: 0]
  total_reviews int [not null, default: 0]
  bayesian_score decimal(5,3) [not null, default: 0]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    bayesian_score
    avg_rating
  }
}

Table user_rating_summary {
  user_id uuid [pk]
  avg_rating decimal(3,2) [not null, default: 0]
  total_reviews int [not null, default: 0]
  sportsmanship_score decimal(5,2) [not null, default: 0]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    avg_rating
    sportsmanship_score
  }
}

Table ai_usage_logs {
  id uuid [pk]
  user_id uuid [not null]
  feature varchar [not null, note: 'chatbot, moderation, match_suggestion']
  tokens_used int [not null, default: 0]
  created_at timestamptz [not null, default: `now()`]

  indexes {
    user_id
    feature
    (user_id, created_at)
    (user_id, feature, created_at)
  }
}

Ref: user_profiles.user_id > users.id
Ref: owner_profiles.user_id > users.id

Ref: fields.owner_id > users.id
Ref: field_courts.field_id > fields.id
Ref: field_images.field_id > fields.id
Ref: field_services.field_id > fields.id
Ref: field_pricing.field_id > fields.id
Ref: field_opening_hours.field_id > fields.id
Ref: field_blocked_slots.field_court_id > field_courts.id

Ref: bookings.user_id > users.id
Ref: bookings.field_id > fields.id
Ref: bookings.field_court_id > field_courts.id
Ref: bookings.cancelled_by > users.id
Ref: booking_services.booking_id > bookings.id
Ref: booking_services.service_id > field_services.id

Ref: posts.user_id > users.id
Ref: post_comments.post_id > posts.id
Ref: post_comments.user_id > users.id
Ref: conversations.related_post_id > posts.id
Ref: conversations.related_field_id > fields.id
Ref: post_matches.post_id > posts.id
Ref: post_matches.applicant_id > users.id
Ref: post_matches.conversation_id > conversations.id

Ref: conversation_members.conversation_id > conversations.id
Ref: conversation_members.user_id > users.id
Ref: messages.conversation_id > conversations.id
Ref: messages.sender_id > users.id

Ref: notifications.user_id > users.id

Ref: subscriptions.owner_id > users.id
Ref: subscriptions.plan_id > subscription_plans.id
Ref: transactions.user_id > users.id

Ref: approval_requests.requested_by > users.id
Ref: approval_requests.reviewed_by > users.id

Ref: field_reviews.field_id > fields.id
Ref: field_reviews.reviewer_id > users.id
Ref: field_reviews.booking_id > bookings.id
Ref: user_reviews.target_user_id > users.id
Ref: user_reviews.reviewer_id > users.id
Ref: user_reviews.post_id > posts.id

Ref: field_rating_summary.field_id - fields.id
Ref: user_rating_summary.user_id - users.id

Ref: ai_usage_logs.user_id > users.id
```

## 5. Quy tắc timestamp

- Quyết định chính thức: sử dụng `timestamptz`.
- `timestamptz` dùng cho mốc thời gian hệ thống và lưu theo UTC.
- Không được đổi các column thời gian hệ thống về `timestamp`.
- `date` và `time` dùng cho lịch sân theo giờ địa phương.
- Bảng có dữ liệu thay đổi dùng cả `created_at` và `updated_at`.
- `ai_usage_logs` là log bất biến nên chỉ có `created_at`.
- Rating summary là dữ liệu tổng hợp nên chỉ có `updated_at`.
- `conversation_members` dùng các mốc riêng: `joined_at`, `last_read_at`, `deleted_at`.

## 6. Unique và check constraint

| Phạm vi | Quy tắc |
|---|---|
| OAuth | Unique `(auth_provider, provider_id)` |
| Pricing | Cho phép các record giá trùng hoàn toàn; không tạo unique constraint |
| Thumbnail | Partial unique index trên `field_images(field_id)` với điều kiện `is_thumbnail = true` |
| Rating | `field_reviews.rating` và `user_reviews.rating` trong khoảng `1..5` |
| Khoảng giờ | `start_time < end_time` khi có đủ hai giá trị |
| Opening hours | Nếu `is_closed = false` thì open/close time bắt buộc và `open_time < close_time` |
| Số tiền | Các column tiền phải `>= 0` |
| Số lượng | `quantity`, `max_players`, `duration_days` phải `> 0` |
| Counter | `tokens_used`, `total_reviews` phải `>= 0` |

## 7. Chính sách foreign key

- Tất cả foreign key dùng `ON UPDATE NO ACTION`.
- TypeORM tự sinh tên foreign key, index và constraint.

| Foreign key | `ON DELETE` |
|---|---|
| `user_profiles.user_id`, `owner_profiles.user_id` | `CASCADE` |
| `fields.owner_id` | `RESTRICT` |
| `field_courts.field_id`, `field_images.field_id`, `field_services.field_id`, `field_pricing.field_id`, `field_opening_hours.field_id` | `CASCADE` |
| `field_blocked_slots.field_court_id` | `CASCADE` |
| `bookings.user_id`, `bookings.field_id` | `RESTRICT` |
| `bookings.field_court_id`, `bookings.cancelled_by` | `SET NULL` |
| `booking_services.booking_id` | `CASCADE` |
| `booking_services.service_id` | `RESTRICT` |
| `posts.user_id` | `RESTRICT` |
| `post_comments.post_id` | `CASCADE` |
| `post_comments.user_id` | `RESTRICT` |
| `conversations.related_post_id`, `conversations.related_field_id` | `SET NULL` |
| `post_matches.post_id` | `CASCADE` |
| `post_matches.applicant_id` | `RESTRICT` |
| `post_matches.conversation_id` | `SET NULL` |
| `conversation_members.conversation_id`, `messages.conversation_id` | `CASCADE` |
| `conversation_members.user_id`, `notifications.user_id`, `ai_usage_logs.user_id` | `CASCADE` |
| `messages.sender_id` | `RESTRICT` |
| `subscriptions.owner_id`, `subscriptions.plan_id`, `transactions.user_id` | `RESTRICT` |
| `approval_requests.requested_by` | `RESTRICT` |
| `approval_requests.reviewed_by` | `SET NULL` |
| `field_reviews.field_id`, `field_reviews.reviewer_id`, `field_reviews.booking_id` | `RESTRICT` |
| `user_reviews.target_user_id`, `user_reviews.reviewer_id`, `user_reviews.post_id` | `RESTRICT` |
| `field_rating_summary.field_id`, `user_rating_summary.user_id` | `CASCADE` |

## 8. Quan hệ không tạo foreign key

| Bảng | Column | Quy tắc |
|---|---|---|
| `transactions` | `ref_id` | Trỏ tới `subscriptions.id` hoặc `bookings.id` theo `type` |
| `approval_requests` | `target_id` | Trỏ tới `owner_profiles.id` hoặc `fields.id` theo `type` |
| `notifications` | `ref_id` | Trỏ tới đối tượng nghiệp vụ theo notification `type` |

## 9. Quy tắc bắt buộc ở service

- Khi owner gán sân: court phải thuộc đúng field và đúng `requested_court_type`.
- Chống trùng lịch bằng điều kiện giao khoảng thời gian trong transaction.
- Field review chỉ hợp lệ với booking `completed` của reviewer.
- User review chỉ hợp lệ giữa người tham gia post match đã `accepted`.
- Trạng thái đã đọc chat dùng `conversation_members.last_read_at`.
- Rate limit AI dùng Redis; PostgreSQL chỉ lưu usage log.

## 10. Retention

- Không lưu dữ liệu vô thời hạn.
- Dữ liệu hết hạn được xóa bằng scheduled job theo `created_at` hoặc `deleted_at`.
- Chưa tạo migration hoặc scheduled job cho retention đến khi chốt thời gian và phạm vi từng nhóm dữ liệu.

## 11. Nội dung chưa xác định

- Công thức rating summary.
- Thời gian lưu và phạm vi xóa của từng nhóm dữ liệu.

Agent không được tự quyết định các nội dung trên nếu source hiện tại không có căn cứ.
