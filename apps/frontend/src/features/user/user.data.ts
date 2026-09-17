export type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled'
export interface UserBooking { id: string; field: string; location: string; date: string; time: string; price: number; status: BookingStatus; image: string }
export interface MatchPost { id: string; title: string; team: string; location: string; date: string; time: string; format: '5v5' | '7v7' | '11v11'; level: string; needed: number; applicants: number; status: 'open' | 'matched' | 'closed'; description: string }
export interface Conversation { id: string; name: string; preview: string; online: boolean; unread: number; kind: 'field' | 'team' }
export interface ChatMessage { id: string; conversationId: string; body: string; sentAt: string; sender: 'me' | 'them' }

const pitchImage = 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=900&q=80'
export const userBookings: UserBooking[] = [
  { id: 'PM-1400', field: 'Sector 4 · Alpha Pitch', location: 'Terminal Hub North', date: '24/10/2026', time: '18:00 – 21:00', price: 1400000, status: 'confirmed', image: pitchImage },
  { id: 'PM-0950', field: 'Cage Beta · 5v5', location: 'Urban Docks Facility', date: '28/10/2026', time: '20:00 – 21:30', price: 950000, status: 'pending', image: pitchImage },
  { id: 'PM-0320', field: 'Main Stadium Pitch', location: 'Terminal Hub North', date: '02/11/2026', time: '18:00 – 19:00', price: 320000, status: 'confirmed', image: pitchImage },
  { id: 'PM-0860', field: 'North Grid Arena', location: 'Thủ Đức', date: '12/08/2026', time: '19:00 – 21:00', price: 860000, status: 'completed', image: pitchImage },
]

export const matchPosts: MatchPost[] = [
  { id: 'north-london', title: 'Tìm đối giao hữu sân 7', team: 'Neon Strikers', location: 'Sector 7 Pitch, Quận 7', date: '24/10/2026', time: '20:00 – 21:00', format: '7v7', level: 'Trung bình khá', needed: 1, applicants: 4, status: 'open', description: 'Đội chơi thường xuyên, tìm đối giao hữu cạnh tranh nhưng văn minh. Sân đã đặt và thanh toán, vui lòng đến trước 15 phút để khởi động.' },
  { id: 'silver-five', title: 'Cần 2 cầu thủ cho đội 5 người', team: 'Urban Dynamics', location: 'Highland Park, Thủ Đức', date: '28/10/2026', time: '18:30 – 19:30', format: '5v5', level: 'Khá', needed: 2, applicants: 1, status: 'open', description: 'Cần bổ sung hai cầu thủ đá cánh. Ưu tiên người chơi đúng giờ và có tinh thần đồng đội.' },
  { id: 'river-kickoff', title: 'Kèo bóng cuối tuần', team: 'Weekend Warriors', location: 'Riverfront Arena, Quận 2', date: '02/11/2026', time: '08:00 – 09:30', format: '7v7', level: 'Phong trào', needed: 1, applicants: 0, status: 'open', description: 'Giao hữu sáng chủ nhật, đá vui và chia đều tiền sân.' },
  { id: 'eastside-training', title: 'Tập luyện Eastside', team: 'Eastside Complex', location: 'Cage B', date: '06/11/2026', time: '20:00 – 21:30', format: '5v5', level: 'Tập luyện', needed: 0, applicants: 2, status: 'matched', description: 'Buổi tập đã ghép đủ thành viên.' },
]

export const conversations: Conversation[] = [
  { id: 'sector-four', name: 'Sector 4 Arena', preview: 'Đã xác nhận lịch đặt sân của bạn.', online: true, unread: 2, kind: 'field' },
  { id: 'alex-mercer', name: 'Alex Mercer', preview: 'Đội bạn còn cần thêm người không?', online: false, unread: 0, kind: 'team' },
  { id: 'referee', name: 'Referee Association', preview: 'Trọng tài đã được xác nhận.', online: true, unread: 0, kind: 'team' },
]

export const initialMessages: ChatMessage[] = [
  { id: 'm1', conversationId: 'sector-four', body: 'Lịch đặt sân 18:00 – 21:00 đã được xác nhận. Mã cổng của bạn là 8402.', sentAt: '09:15', sender: 'them' },
  { id: 'm2', conversationId: 'sector-four', body: 'Đã rõ. Phòng thay đồ có mở trước giờ thi đấu không?', sentAt: '09:16', sender: 'me' },
  { id: 'm3', conversationId: 'sector-four', body: 'Phòng thay đồ mở trước 30 phút. Bạn vui lòng tự chuẩn bị giày.', sentAt: '09:20', sender: 'them' },
]
