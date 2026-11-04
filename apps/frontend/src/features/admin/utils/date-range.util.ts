import dayjs, { type Dayjs } from 'dayjs';
import type {
  DateFilterPreset,
  DateRangeResult,
} from '../constants/date-filter.constant';

export const getDateRangeFromPreset = (
  preset: DateFilterPreset,
  customRange?: [Dayjs | null, Dayjs | null] | null,
): DateRangeResult => {
  const now = dayjs();

  switch (preset) {
    case 'today': {
      const todayStr = now.format('YYYY-MM-DD');
      return {
        fromDate: todayStr,
        toDate: todayStr,
      };
    }
    case 'this_week': {
      // Tuần này: từ đầu tuần đến cuối tuần
      return {
        fromDate: now.startOf('week').format('YYYY-MM-DD'),
        toDate: now.endOf('week').format('YYYY-MM-DD'),
      };
    }
    case 'this_month': {
      // Tháng này: từ đầu tháng đến cuối tháng
      return {
        fromDate: now.startOf('month').format('YYYY-MM-DD'),
        toDate: now.endOf('month').format('YYYY-MM-DD'),
      };
    }
    case 'custom': {
      if (customRange && customRange[0] && customRange[1]) {
        return {
          fromDate: customRange[0].format('YYYY-MM-DD'),
          toDate: customRange[1].format('YYYY-MM-DD'),
        };
      }
      return {};
    }
    case 'all':
    default:
      return {};
  }
};
