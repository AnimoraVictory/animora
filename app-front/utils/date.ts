export const isValidDate = (dateStr: string): boolean => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

export function dateISOToJapanese(dateISO: string): string {
  const [year, month, day] = dateISO.split('-');
  return `${year}年${month}月${day}日`;
}
