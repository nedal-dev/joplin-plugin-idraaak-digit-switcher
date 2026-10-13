import { convertDigits, isDigitStyle } from '../digits';
function initializePreview(): void {
  const encodedSelection = document.getElementById('digit-switcher')?.getAttribute('data-selection');
  const original = document.getElementById('original') as HTMLTextAreaElement | null;
  const target = document.getElementById('target') as HTMLSelectElement | null;
  const preview = document.getElementById('preview') as HTMLTextAreaElement | null;
  if (!original || !target || !preview || !encodedSelection) return;
  // Preserve the captured text, including a leading newline that HTML textarea parsing removes.
  const selection: string = JSON.parse(encodedSelection);
  original.value = selection;
  const update = () => {
    if (isDigitStyle(target.value)) preview.value = convertDigits(selection, target.value);
  };
  target.addEventListener('change', update);
  update();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePreview, { once: true });
} else {
  initializePreview();
}
