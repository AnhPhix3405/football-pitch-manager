import type { Conversation, ChatMessage } from '../chat/interface/chat.types'

export type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled'
export interface UserBooking {
  id: string;
  field: string;
  location: string;
  date: string;
  time: string;
  price: number;
  status: BookingStatus;
  image: string
}
export interface MatchPost {
  id: string;
  title: string;
  team: string;
  location: string;
  date: string;
  time: string;
  format: '5v5' | '7v7' | '11v11';
  level: string;
  needed: number;
  applicants: number;
  status: 'open' | 'matched' | 'closed';
  description: string;
  imageUrl?: string;
  authorAvatar?: string;
  authorName?: string
}
export type { Conversation, ChatMessage }

const pitchImage = 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=900&q=80'
export const userBookings: UserBooking[] = [
  {
    id: 'PM-1400',
    field: 'Sector 4 · Alpha Pitch',
    location: 'Terminal Hub North',
    date: '24/10/2026',
    time: '18:00 – 21:00',
    price: 1400000,
    status: 'confirmed',
    image: pitchImage
  },
  {
    id: 'PM-0950',
    field: 'Cage Beta · 5v5',
    location: 'Urban Docks Facility',
    date: '28/10/2026',
    time: '20:00 – 21:30',
    price: 950000,
    status: 'pending',
    image: pitchImage
  },
  { id: 'PM-0320', field: 'Main Stadium Pitch', location: 'Terminal Hub North', date: '02/11/2026', time: '18:00 – 19:00', price: 320000, status: 'confirmed', image: pitchImage },
  { id: 'PM-0860', field: 'North Grid Arena', location: 'Thủ Đức', date: '12/08/2026', time: '19:00 – 21:00', price: 860000, status: 'completed', image: pitchImage },
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
