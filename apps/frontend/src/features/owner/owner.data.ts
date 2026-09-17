export type OwnerFieldStatus = 'active' | 'pending' | 'maintenance'
export interface OwnerField { id: string; name: string; address: string; format: '5v5' | '7v7' | '11v11'; price: number; status: OwnerFieldStatus; bookingsToday: number; image: string }
export interface OwnerService { id: string; name: string; price: number; unit: string; active: boolean }
export interface OwnerBooking { id: string; customer: string; phone: string; field: string; date: string; time: string; amount: number; deposit: number; status: 'confirmed' | 'pending' | 'cancelled'; notes: string }

const fieldImage = 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1000&q=80'
export const ownerFields: OwnerField[] = [
  { id: 'alpha-pitch', name: 'Terminal Alpha Pitch', address: '18 Nguyễn Lương Bằng, Quận 7', format: '7v7', price: 450000, status: 'active', bookingsToday: 8, image: fieldImage },
  { id: 'cage-beta', name: 'Cage Beta · 5v5', address: '20 Nguyễn Lương Bằng, Quận 7', format: '5v5', price: 320000, status: 'active', bookingsToday: 5, image: fieldImage },
  { id: 'north-training', name: 'North Training Grid', address: '22 Nguyễn Lương Bằng, Quận 7', format: '5v5', price: 280000, status: 'pending', bookingsToday: 0, image: fieldImage },
]
export const ownerServices: OwnerService[] = [
  { id: 'ball', name: 'Thuê bóng thi đấu', price: 30000, unit: 'trận', active: true },
  { id: 'bib', name: 'Thuê áo bib', price: 40000, unit: 'bộ', active: true },
  { id: 'water', name: 'Nước uống cho đội', price: 50000, unit: 'thùng', active: true },
  { id: 'referee', name: 'Trọng tài', price: 250000, unit: 'trận', active: false },
]
export const ownerBookings: OwnerBooking[] = [
  { id: 'BK-8402', customer: 'Nguyễn Minh Anh', phone: '090 123 4567', field: 'Terminal Alpha Pitch', date: '24/10/2026', time: '18:00 – 21:00', amount: 1400000, deposit: 420000, status: 'confirmed', notes: 'Đội cần mở phòng thay đồ trước 30 phút.' },
  { id: 'BK-8491', customer: 'Trần Quốc Huy', phone: '091 883 2201', field: 'Cage Beta · 5v5', date: '24/10/2026', time: '20:00 – 21:30', amount: 950000, deposit: 0, status: 'pending', notes: 'Chưa thanh toán tiền cọc.' },
  { id: 'BK-8510', customer: 'Lê Tuấn Kiệt', phone: '098 410 0224', field: 'Terminal Alpha Pitch', date: '25/10/2026', time: '17:00 – 18:00', amount: 450000, deposit: 135000, status: 'confirmed', notes: '' },
]
export const transactions = [
  { id: 'TX-20261024-01', date: '24/10/2026', description: 'Booking BK-8402', amount: 420000, status: 'Thành công' },
  { id: 'TX-20261022-07', date: '22/10/2026', description: 'Gói Pro Facility', amount: -499000, status: 'Thành công' },
  { id: 'TX-20261020-04', date: '20/10/2026', description: 'Booking BK-8290', amount: 320000, status: 'Thành công' },
]
