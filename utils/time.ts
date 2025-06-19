export const getCurrentTimeZone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const getTimezoneAbbreviation = () => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const formatter = new Intl.DateTimeFormat('en', {
    timeZoneName: 'short',
    timeZone: timeZone,
  });

  const parts = formatter.formatToParts(new Date());
  const timeZonePart = parts.find((part) => part.type === 'timeZoneName');
  const timezoneAbbreviation = timeZonePart?.value || '';

  return timezoneAbbreviation;
};

export const formatDateTime = (date: Date | number) => {
  const dateObj = typeof date === 'number' ? new Date(date) : date;

  const dateFormatter = new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timeFormatter = new Intl.DateTimeFormat('en', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateStr = dateFormatter.format(dateObj);
  const timeStr = timeFormatter.format(dateObj);

  return `${dateStr} (${timeStr})`;
};
