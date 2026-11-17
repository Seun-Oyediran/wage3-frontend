/** Copies `text` to the clipboard. False when the browser refuses (an insecure page, or no permission). */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
