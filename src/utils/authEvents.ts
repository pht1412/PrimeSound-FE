/** Bắn sau khi đăng nhập (cùng tab) để context refetch dữ liệu cần token */
export const AUTH_CHANGED_EVENT = "primesound-auth-changed";

export function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}
