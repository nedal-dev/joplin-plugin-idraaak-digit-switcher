# Development and release checks

Generated from the official `generator-joplin` 3.7.2 scaffolding with Yeoman 4.3.1. The generated build framework and API declarations are retained. TypeScript checks use `skipLibCheck` because the generated declaration files refer to Joplin-internal modules that are not shipped in the scaffold; plugin source is checked in strict mode.

```sh
npm ci --ignore-scripts
npm run check
npm run dist
npm test
npm pack --dry-run --ignore-scripts
```

The unit and mocked-host tests do **not** replace a real desktop test.

## Mandatory real Joplin test before npm publication

1. Install Joplin desktop from its official website. This plugin declares Joplin 3.7 or later; record the exact version tested.
2. In Joplin, use **Help → Copy dev mode command to clipboard**. Run that command to open its separate development profile. Do not test in a normal notes profile.
3. In the development instance, use **Configuration → Plugins → Advanced Settings → Development plugins**. Add the absolute path to this repository and restart the development instance.
4. Create a disposable Markdown note containing:

   ```text
   طلب 0012 — invoice ٠٠٣٤: مبلغ ۰۰۵۶٫۷۸، -09.50% / ٢٠٢٦-۱۰-13
   **Markdown 007** and `code ٠٨` and https://example.test/09
   ```

5. Select the first line. Open **Tools → Idraaak Digit Switcher: preview selected text**. Check all three output styles against `tests/digits.test.cjs`. Repeat through the editor context menu.
6. Click **Copy to clipboard**, paste into a second disposable note, and compare the full text. Confirm the original note is unchanged. Repeat all three styles; confirm leading zeros, punctuation, Unicode marks and line breaks are retained.
7. Repeat with an empty selection, a selection without digits, multiline text, HTML-looking text such as `</textarea><script>1</script>`, and a long selection. Close the dialog without copying; confirm the clipboard is unchanged.
8. Check keyboard navigation, right-to-left text, and light/dark themes. Confirm the command is unavailable in Rich Text mode. Repeat conversion without a network connection; do not disable the computer's security protections.
9. Capture a genuine screenshot of the selected note and preview in the development instance. Save it as `screenshots/joplin-usage.png`; add it to README and `src/manifest.json` only after verifying its contents.
10. Record the version, OS, date, checks and screenshot in a test report. Fix failures and rerun relevant checks before publishing.

## Publication

The official publishing instructions checked on 2026-10-13 require an npm package whose name starts with `joplin-plugin-`, whose keywords include `joplin-plugin`, and whose `publish/` directory contains the generated `.jpl` and `.json` files.

After the real desktop test and screenshot are complete, authenticate to the approved npm account interactively, check `npm whoami`, inspect `npm pack --dry-run`, and run `npm publish --access public`. Never place tokens or passwords in this repository.

Verify the npm package contents and version after publishing. The official plugin repository states that it updates every 30 minutes. Verify the manifest and archive in `joplin/plugins`, then the actual Joplin directory page. Do not mark the task complete while any required step is pending.

For the Joplin page, record the final HTTP status, developer link `href` and `rel`, meta/header robots directives, canonical URL, relevant robots.txt rules, and the link from the directory. Treat search-engine appearance as a separate check.

Official references:

- https://joplinapp.org/help/api/get_started/plugins/
- https://joplinapp.org/help/api/references/development_mode/
- https://joplinapp.org/help/api/references/plugin_manifest/
- https://github.com/joplin/plugins
- https://github.com/laurent22/joplin/blob/dev/packages/generator-joplin/generators/app/templates/GENERATOR_DOC.md
