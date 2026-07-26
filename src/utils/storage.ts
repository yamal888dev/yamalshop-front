/** ตัวช่วยอ่าน/เขียน localStorage แบบมี type และกัน error (JSON parse ล้มเหลว ฯลฯ) */

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // เต็ม / ปิดใช้งาน localStorage — ข้ามไปอย่างเงียบ ๆ
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}
