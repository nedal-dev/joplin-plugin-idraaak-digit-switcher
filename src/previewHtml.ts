export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]!));
}
export function previewHtml(selection: string): string {
  return `<main id="digit-switcher" data-selection="${escapeHtml(JSON.stringify(selection))}">
    <h1>Idraaak Digit Switcher</h1>
    <p>Choose a digit style, review the preview, then copy it. Your note stays unchanged.</p>
    <form name="digits">
      <label for="original">Selected Markdown text</label>
      <textarea id="original" readonly dir="auto" spellcheck="false">${escapeHtml(selection)}</textarea>
      <label for="target">Output digit style</label>
      <select id="target" name="target">
        <option value="western">Western — 0123456789</option>
        <option value="arabicIndic">Arabic-Indic — ٠١٢٣٤٥٦٧٨٩</option>
        <option value="easternArabicIndic">Eastern Arabic-Indic — ۰۱۲۳۴۵۶۷۸۹</option>
      </select>
      <label for="preview">Copyable preview</label>
      <textarea id="preview" readonly dir="auto" spellcheck="false" aria-describedby="privacy"></textarea>
    </form>
    <p id="privacy">Local conversion · no network requests · no tracking</p>
  </main>`;
}
