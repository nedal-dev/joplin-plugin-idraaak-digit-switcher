export const digitStyles = {
  western: '0123456789',
  arabicIndic: '٠١٢٣٤٥٦٧٨٩',
  easternArabicIndic: '۰۱۲۳۴۵۶۷۸۹',
} as const;

export type DigitStyle = keyof typeof digitStyles;
export function isDigitStyle(value: unknown): value is DigitStyle {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(digitStyles, value);
}
/** Map code points, never parse numbers or normalize the surrounding text. */
export function convertDigits(text: string, target: DigitStyle): string {
  if (!isDigitStyle(target)) throw new TypeError('Unknown digit style');
  return text.replace(/[0-9\u0660-\u0669\u06f0-\u06f9]/g, digit => {
    const code = digit.charCodeAt(0);
    const zero = code <= 0x39 ? 0x30 : code <= 0x669 ? 0x660 : 0x6f0;
    return digitStyles[target][code - zero];
  });
}
