const ALPHANUM = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Sinh ID dạng chuỗi cố định độ dài, dùng cho các PK kiểu Char(n) không có default.
 * Format: <prefix><timestamp base36><random>, luôn đúng `length` ký tự.
 */
export function generateId(prefix: string, length: number): string {
  if (prefix.length >= length) {
    return prefix.slice(0, length).toUpperCase();
  }

  const remaining = length - prefix.length;
  let body = Date.now().toString(36).toUpperCase();

  if (body.length > remaining) {
    body = body.slice(body.length - remaining);
  } else if (body.length < remaining) {
    for (let i = body.length; i < remaining; i++) {
      body += ALPHANUM[Math.floor(Math.random() * ALPHANUM.length)];
    }
  }

  return (prefix + body).toUpperCase();
}
