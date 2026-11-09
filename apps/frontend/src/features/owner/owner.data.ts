import type { FieldFormat } from '../../constants'

export type OwnerFieldStatus = 'active' | 'pending' | 'maintenance'
export interface OwnerField { id: string; name: string; address: string; format: FieldFormat; price: number; status: OwnerFieldStatus; bookingsToday: number; image: string }
export interface OwnerService { id: string; name: string; price: number; unit: string; active: boolean }


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
