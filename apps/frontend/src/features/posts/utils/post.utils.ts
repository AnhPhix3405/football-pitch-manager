import dayjs from 'dayjs'

export function isSlotExpired(slot: string, selectedDate?: dayjs.Dayjs | null): boolean {
  if (!selectedDate || !dayjs().isSame(selectedDate, 'day')) {
    return false
  }
  const [start] = slot.split(' - ')
  const [hours, minutes] = start.split(':').map(Number)
  const slotStartTime = dayjs().hour(hours).minute(minutes).second(0)
  return dayjs().isAfter(slotStartTime)
}
