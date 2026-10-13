import joplin from 'api';
import { MenuItemLocation } from 'api/types';
import { convertDigits, isDigitStyle } from './digits';
import { previewHtml } from './previewHtml';

joplin.plugins.register({
  onStart: async () => {
    const dialog = await joplin.views.dialogs.create('idraaakDigitPreview');
    await joplin.views.dialogs.addScript(dialog, './webviews/preview.css');
    await joplin.views.dialogs.addScript(dialog, './webviews/preview.js');
    await joplin.views.dialogs.setButtons(dialog, [
      { id: 'copy', title: 'Copy to clipboard' },
      { id: 'cancel', title: 'Close' },
    ]);
    let opening = false;
    await joplin.commands.register({
      name: 'idraaakDigitSwitcher',
      label: 'Idraaak Digit Switcher: preview selected text',
      enabledCondition: 'markdownEditorPaneVisible && oneNoteSelected',
      execute: async () => {
        if (opening) return;
        opening = true;
        try {
          const selection = await joplin.commands.execute('selectedText');
          if (typeof selection !== 'string' || selection.length === 0) {
            await joplin.views.dialogs.showMessageBox('Select text in the Markdown editor first.');
            return;
          }
          await joplin.views.dialogs.setHtml(dialog, previewHtml(selection));
          const result = await joplin.views.dialogs.open(dialog);
          if (result.id !== 'copy') return;
          const target = result.formData?.digits?.target;
          if (!isDigitStyle(target)) {
            await joplin.views.dialogs.showMessageBox('Choose a valid output digit style and try again.');
            return;
          }
          await joplin.clipboard.writeText(convertDigits(selection, target));
        } finally {
          opening = false;
        }
      },
    });
    await joplin.views.menuItems.create('idraaakDigitSwitcherTools', 'idraaakDigitSwitcher', MenuItemLocation.Tools);
    await joplin.views.menuItems.create('idraaakDigitSwitcherContext', 'idraaakDigitSwitcher', MenuItemLocation.EditorContextMenu);
  },
});
