# Idraaak Digit Switcher

Preview and copy selected Markdown text using the digit style you need, entirely offline.

**Validation:** initial release 0.1.0. All 23 automated conversion, preview, mocked-host and archive tests pass. Actual Joplin desktop validation is incomplete: the Linux UI test launched Joplin 3.7.21 but timed out before reaching the Markdown editor. A genuine usage screenshot is still pending. Please report reproducible desktop issues in the repository.

## What it does

Convert any mixture of these three digit sets to one chosen style:

| Style | Digits |
| --- | --- |
| Western (ASCII) | `0123456789` |
| Arabic-Indic | `٠١٢٣٤٥٦٧٨٩` |
| Eastern Arabic-Indic (commonly used in Persian) | `۰۱۲۳۴۵۶۷۸۹` |

For example:

```text
Selected:     طلب 0012 — invoice ٠٠٣٤: مبلغ ۰۰۵۶٫۷۸
Western:      طلب 0012 — invoice 0034: مبلغ 0056٫78
Arabic-Indic: طلب ٠٠١٢ — invoice ٠٠٣٤: مبلغ ٠٠٥٦٫٧٨
Eastern:      طلب ۰۰۱۲ — invoice ۰۰۳۴: مبلغ ۰۰۵۶٫۷۸
```

It replaces digit characters only. It does not parse, calculate, round or reformat numbers. Leading zeros, signs, decimal separators, punctuation, letters, Markdown syntax and other Unicode characters are preserved. Digits inside selected links and code are converted too; inspect the preview before pasting it into a URL or code snippet. Other numeral systems, such as full-width digits or Devanagari digits, are left unchanged.

## Use

The first version targets **Joplin desktop 3.7+ and its Markdown editor**. Mobile and Rich Text support are outside this version's scope.

1. Select text in the Markdown editor.
2. Open **Tools → Idraaak Digit Switcher: preview selected text**, or use the same command in the editor's context menu.
3. Choose an output digit style. Review the copyable preview.
4. Click **Copy to clipboard**, then paste wherever you need it. The original note stays unchanged. You can also select text in the preview and use your normal copy shortcut.

The output is a snapshot of the selection when the command opens. Closing the dialog without copying leaves the clipboard unchanged.

## Install

Build from source using the commands in [DEVELOPMENT.md](https://github.com/nedal-dev/joplin-plugin-idraaak-digit-switcher/blob/main/DEVELOPMENT.md), or download the npm package `joplin-plugin-idraaak-digit-switcher` and extract `publish/com.idraaak.digitSwitcher.jpl`. In Joplin, open **Configuration → Plugins → Install from file**, select the `.jpl` archive and restart Joplin. Start with a disposable note in a separate development profile while desktop validation remains pending. Official directory availability must be checked separately from npm publication.

## Privacy

Conversion runs locally. The plugin makes no network requests, uses no external service, has no telemetry or analytics, and does not log or store selected text. Text is held in the dialog while it is in use; clicking Copy writes the converted selection to the system clipboard. There are no runtime npm dependencies.

## شرح عربي مختصر

حدّد نصًا في محرر Markdown في Joplin، ثم افتح أمر الإضافة من قائمة الأدوات واختر شكل الأرقام. راجع المعاينة وانسخ النتيجة. يتحوّل شكل محارف الأرقام فقط، مع الحفاظ على الأصفار الأولية والنص وعلامات الترقيم، ولا تتغير الملاحظة الأصلية. تعمل الإضافة محليًا دون إنترنت أو تتبع. نجحت الاختبارات الآلية، لكن الاختبار الفعلي داخل Joplin لم يكتمل؛ يُنصح بتجربتها أولًا في ملاحظة تجريبية وملف تطوير مستقل.

## Development and license

Built with the official Joplin plugin scaffolding. See [DEVELOPMENT.md](https://github.com/nedal-dev/joplin-plugin-idraaak-digit-switcher/blob/main/DEVELOPMENT.md) for tests, build commands and release checks. Contributions and reproducible bug reports are welcome in the repository's issue tracker. When reporting a problem, use a small sample with no private note content.

MIT licensed; see [LICENSE](https://github.com/nedal-dev/joplin-plugin-idraaak-digit-switcher/blob/main/LICENSE).

Developed by [Idraaak](https://idraaak.com/)
