import isSameMonth from '@/utils/time/isSameMonth';
import isSameYear from '@/utils/time/isSameYear';

const isSameYearMonth = (date1: Date, date2: Date) => {
  return isSameYear(date1, date2) && isSameMonth(date1, date2);
};

export default isSameYearMonth;
