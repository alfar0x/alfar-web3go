export const randomInt = (min: number, max: number) => {
  const roundedMin = Math.ceil(min);
  const roundedMax = Math.floor(max);

  return Math.floor(Math.random() * (roundedMax - roundedMin + 1)) + roundedMin;
};

export const roundToDecimal = (n: number, decimalPlaces: number) => {
  const number = Number(n);

  if (decimalPlaces < 0) return NaN;
  const multiplier = Math.pow(10, decimalPlaces);
  return Math.round(number * multiplier) / multiplier;
};

export const randomFloat = (
  min: number,
  max: number,
  decimalPlaces: number,
) => {
  const rnd = Math.random() * (max - min) + min;
  if (decimalPlaces === undefined) return rnd;
  return roundToDecimal(rnd, decimalPlaces);
};

export const shuffle = <T>(array: T[]): T[] =>
  [...array].sort(() => Math.random() - 0.5);

export const randomChoice = <T>(array: T[]) =>
  array[Math.floor(Math.random() * array.length)];
