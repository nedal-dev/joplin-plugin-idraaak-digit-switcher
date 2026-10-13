const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-ts.cjs');

async function harness(selection, result) {
  const calls = { copied: [], messages: [], menus: [], html: [], opened: 0 };
  let registration, command;
  const mock = {
    plugins: { register: value => { registration = value; } },
    commands: { register: async value => { command = value; }, execute: async name => {
      assert.equal(name, 'selectedText'); return selection;
    } },
    clipboard: { writeText: async value => calls.copied.push(value) },
    views: {
      dialogs: {
        create: async () => 'dialog', addScript: async () => {}, setButtons: async () => {},
        setHtml: async (_, html) => calls.html.push(html),
        open: async () => { calls.opened++; return typeof result === 'function' ? await result() : result; },
        showMessageBox: async value => calls.messages.push(value),
      },
      menuItems: { create: async (...args) => calls.menus.push(args) },
    },
  };
  load('src/index.ts', { api: { default: mock }, 'api/types': { MenuItemLocation: { Tools: 'tools', EditorContextMenu: 'editorContextMenu' } } });
  await registration.onStart();
  return { calls, command };
}
test('command reads selection and copies exactly the chosen conversion', async () => {
  const { calls, command } = await harness('نص 00١۲.30', { id: 'copy', formData: { digits: { target: 'arabicIndic' } } });
  assert.equal(command.enabledCondition, 'markdownEditorPaneVisible && oneNoteSelected');
  assert.equal(calls.menus.length, 2);
  await command.execute();
  assert.deepEqual(calls.copied, ['نص ٠٠١٢.٣٠']);
  assert.equal(calls.opened, 1);
});
test('empty selection never opens preview or changes clipboard', async () => {
  const { calls, command } = await harness('', null);
  await command.execute();
  assert.equal(calls.opened, 0);
  assert.equal(calls.messages.length, 1);
  assert.deepEqual(calls.copied, []);
});
test('cancel leaves clipboard unchanged', async () => {
  const { calls, command } = await harness('123', { id: 'cancel' });
  await command.execute();
  assert.deepEqual(calls.copied, []);
});
test('malformed target cannot trigger a copy', async () => {
  const { calls, command } = await harness('123', { id: 'copy', formData: { digits: { target: '__proto__' } } });
  await command.execute();
  assert.deepEqual(calls.copied, []);
  assert.equal(calls.messages.length, 1);
});
test('repeated invocation does not open competing dialogs', async () => {
  let resolve;
  const { calls, command } = await harness('123', () => new Promise(r => { resolve = r; }));
  const first = command.execute();
  await new Promise(r => setImmediate(r));
  await command.execute();
  assert.equal(calls.opened, 1);
  resolve({ id: 'cancel' });
  await first;
  const next = command.execute();
  await new Promise(r => setImmediate(r));
  assert.equal(calls.opened, 2);
  resolve({ id: 'cancel' });
  await next;
});
test('webview displays initial preview and updates all three target styles', () => {
  const listeners = {};
  const elements = {
    'digit-switcher': { getAttribute: () => JSON.stringify('Test 00١۲.3') },
    original: { value: 'Test 00١۲.3' }, target: { value: 'western', addEventListener: (event, fn) => { listeners[event] = fn; } }, preview: { value: '' },
  };
  load('src/webviews/preview.ts', {}, { document: { readyState: 'complete', getElementById: id => elements[id] } });
  assert.equal(elements.preview.value, 'Test 0012.3');
  elements.target.value = 'arabicIndic'; listeners.change();
  assert.equal(elements.preview.value, 'Test ٠٠١٢.٣');
  elements.target.value = 'easternArabicIndic'; listeners.change();
  assert.equal(elements.preview.value, 'Test ۰۰۱۲.۳');
});
test('webview keeps an initial newline from the captured selection', () => {
  const elements = {
    'digit-switcher': { getAttribute: () => JSON.stringify('\n001\r\n٢') },
    original: { value: '' }, target: { value: 'western', addEventListener: () => {} }, preview: { value: '' },
  };
  load('src/webviews/preview.ts', {}, { document: { readyState: 'complete', getElementById: id => elements[id] } });
  assert.equal(elements.preview.value, '\n001\r\n2');
});
