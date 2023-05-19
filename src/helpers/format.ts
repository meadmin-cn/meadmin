export function formatToString(data: any, arrPartition = '\n'): string {
  if (typeof data === 'string') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.reduce(
      (previousValue, currentValue, currentIndex) =>
        previousValue +
        (currentIndex ? arrPartition : '') +
        formatToString(currentValue, arrPartition),
      '',
    );
  }
  return JSON.stringify(data);
}
