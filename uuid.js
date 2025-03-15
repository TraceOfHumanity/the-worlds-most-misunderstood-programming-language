export function generateUUID() {
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  } else {
    // Fallback to a simple UUID generation method if crypto.randomUUID is not available
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }
}
