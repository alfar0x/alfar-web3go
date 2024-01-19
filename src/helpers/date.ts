import { addHours, format } from "date-fns";

export const formatDate = format;

export const startOfNextUTCDay = () => {
  const currentLocalTime = new Date();

  const timezoneOffset = currentLocalTime.getTimezoneOffset();

  const startOfNextDayLocal = new Date(currentLocalTime);
  startOfNextDayLocal.setHours(0, 0, 0, 0);
  startOfNextDayLocal.setDate(startOfNextDayLocal.getDate() + 1);

  const startOfNextDayUTC = new Date(
    startOfNextDayLocal.getTime() - timezoneOffset * 60 * 1000,
  );

  const timestampNextDayUTC = startOfNextDayUTC.getTime();

  return timestampNextDayUTC;
};

export const endOfNextUTCDay = () => {
  const start = startOfNextUTCDay();
  return addHours(start, 24).getTime();
};
