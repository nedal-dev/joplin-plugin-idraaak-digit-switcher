const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-ts.cjs');
const { digitStyles, convertDigits, isDigitStyle } = load('src/digits.ts');
const { escapeHtml, previewHtml } = load('src/previewHtml.ts');
for (const [source, digits] of Object.entries(digitStyles)) {
  for (const [target, expected] of Object.entries(digitStyles)) {
    test(`${source} to ${target}: all ten digits`, () => assert.equal(convertDigits(digits, target), expected));
  }
}
test('mixed Arabic, Persian and English with leading zeros and punctuation', () => {
  const input = 'طلب 0012 — invoice ٠٠٣٤: مبلغ ۰۰۵۶٫۷۸، -09.50% / ٢٠٢٦-۱۰-13\r\n\t✅';
  assert.equal(convertDigits(input, 'western'), 'طلب 0012 — invoice 0034: مبلغ 0056٫78، -09.50% / 2026-10-13\r\n\t✅');
  assert.equal(convertDigits(input, 'arabicIndic'), 'طلب ٠٠١٢ — invoice ٠٠٣٤: مبلغ ٠٠٥٦٫٧٨، -٠٩.٥٠% / ٢٠٢٦-١٠-١٣\r\n\t✅');
  assert.equal(convertDigits(input, 'easternArabicIndic'), 'طلب ۰۰۱۲ — invoice ۰۰۳۴: مبلغ ۰۰۵۶٫۷۸، -۰۹.۵۰% / ۲۰۲۶-۱۰-۱۳\r\n\t✅');
});
test('non-target digits, combining marks, emoji, bidi marks, Markdown and whitespace are unchanged', () => {
  const input = '\u200f**نصّ** [link](example) `code`\t\n² ① １２３ १२३ ১২৩ 𝟙 😀\u200e';
  for (const target of Object.keys(digitStyles)) assert.equal(convertDigits(input, target), input);
});
test('empty text and arbitrary-length values are handled without numeric parsing', () => {
  assert.equal(convertDigits('', 'western'), '');
  const input = '00009007199254740993' + '9'.repeat(10000);
  assert.equal(convertDigits(convertDigits(input, 'arabicIndic'), 'western'), input);
});
test('only digit code points change; target conversion is idempotent', () => {
  const input = Object.values(digitStyles).join(' / ') + '\r\n\u0000\u202e حرفُ e\u0301 🧮';
  for (const target of Object.keys(digitStyles)) {
    const output = convertDigits(input, target);
    assert.equal(output.length, input.length);
    assert.equal(convertDigits(output, target), output);
    for (let i = 0; i < input.length; i++) {
      if (!/[0-9٠-٩۰-۹]/.test(input[i])) assert.equal(output[i], input[i]);
    }
  }
});
test('invalid style and prototype names are rejected', () => {
  for (const value of [null, undefined, 'toString', '__proto__', 'unknown', 0]) {
    assert.equal(isDigitStyle(value), false);
    assert.throws(() => convertDigits('123', value), { name: 'TypeError' });
  }
});
test('selected markup cannot escape the text field or execute scripts', () => {
  const input = '</textarea><script>alert("1")</script>&\' <b>٠1۲</b>';
  const html = previewHtml(input);
  assert.ok(html.includes(escapeHtml(input)));
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<b>'));
});
