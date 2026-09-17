export type AdminEntityStatus = 'active' | 'pending' | 'suspended' | 'rejected'
export interface ApprovalRequest { id: string; type: 'owner' | 'field'; name: string; applicant: string; submittedAt: string; location: string; documents: number; risk: 'low' | 'medium'; status: AdminEntityStatus }
export interface ManagedUser { id: string; name: string; email: string; role: 'user' | 'owner'; joinedAt: string; reports: number; status: AdminEntityStatus }
export interface ModerationItem { id: string; type: 'post' | 'review'; author: string; content: string; reportedAt: string; reason: string; status: 'pending' | 'resolved' }

export const approvalRequests: ApprovalRequest[] = [
  { id: 'OWN-1024', type: 'owner', name: 'Nguyễn Thành Nam', applicant: 'Terminal Sports JSC', submittedAt: '24/10/2026 09:30', location: 'Quận 7, TP.HCM', documents: 3, risk: 'low', status: 'pending' },
  { id: 'FLD-2048', type: 'field', name: 'North Grid Arena', applicant: 'Lê Minh Sports', submittedAt: '24/10/2026 08:15', location: 'Thủ Đức, TP.HCM', documents: 5, risk: 'medium', status: 'pending' },
  { id: 'OWN-1018', type: 'owner', name: 'Trần Quốc Huy', applicant: 'Huy Football Hub', submittedAt: '23/10/2026 16:20', location: 'Bình Thạnh, TP.HCM', documents: 4, risk: 'low', status: 'pending' },
  { id: 'FLD-2039', type: 'field', name: 'River Eleven Park', applicant: 'Riverside FC', submittedAt: '22/10/2026 11:05', location: 'Quận 2, TP.HCM', documents: 6, risk: 'low', status: 'pending' },
]
export const managedUsers: ManagedUser[] = [
  { id: 'USR-0012', name: 'J.D. Matrix', email: 'matrix@pitchmaster.vn', role: 'user', joinedAt: '12/03/2026', reports: 0, status: 'active' },
  { id: 'OWN-0041', name: 'Nguyễn Thành Công', email: 'owner@terminal.vn', role: 'owner', joinedAt: '02/02/2026', reports: 1, status: 'active' },
  { id: 'USR-0088', name: 'Anonymous Striker', email: 'striker88@example.vn', role: 'user', joinedAt: '20/08/2026', reports: 4, status: 'suspended' },
  { id: 'USR-0105', name: 'Minh Hoàng', email: 'hoang.minh@example.vn', role: 'user', joinedAt: '11/10/2026', reports: 0, status: 'active' },
]
export const moderationItems: ModerationItem[] = [
  { id: 'RPT-4401', type: 'post', author: 'Anonymous Striker', content: 'Bài tìm đối có nội dung công kích đội bóng khác.', reportedAt: '24/10/2026 10:20', reason: 'Ngôn từ không phù hợp', status: 'pending' },
  { id: 'RPT-4398', type: 'review', author: 'FC Mercury', content: 'Đánh giá một sao không kèm trải nghiệm đặt sân được xác minh.', reportedAt: '23/10/2026 18:42', reason: 'Đánh giá giả mạo', status: 'pending' },
  { id: 'RPT-4382', type: 'post', author: 'Weekend Club', content: 'Bài đăng trùng lặp nhiều lần trong vòng 10 phút.', reportedAt: '22/10/2026 09:11', reason: 'Spam', status: 'resolved' },
]
export const auditLogs = [
  { id: 'AUD-7782', actor: 'admin@pitchmaster.vn', action: 'APPROVE_FIELD', target: 'FLD-2035', time: '24/10/2026 10:42', ip: '10.42.8.21' },
  { id: 'AUD-7781', actor: 'system', action: 'PAYMENT_RECONCILED', target: 'TX-20261024-01', time: '24/10/2026 10:40', ip: 'internal' },
  { id: 'AUD-7780', actor: 'moderator@pitchmaster.vn', action: 'SUSPEND_USER', target: 'USR-0088', time: '24/10/2026 10:31', ip: '10.42.8.17' },
]
