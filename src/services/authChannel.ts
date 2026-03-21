export type AuthMessage =
  | { type: 'login' }
  | { type: 'logout' }
  | { type: 'refresh'; expires_in: number };

let channel: BroadcastChannel | null = null;

export function initAuthChannel(onMessage: (msg: AuthMessage) => void): void {
  if (typeof BroadcastChannel === 'undefined') return;
  if (channel) {
    channel.onmessage = null;
    channel.close();
  }
  channel = new BroadcastChannel('auth');
  channel.onmessage = (event: MessageEvent<AuthMessage>) => {
    onMessage(event.data);
  };
}

export function broadcastLogin(): void {
  channel?.postMessage({ type: 'login' } satisfies AuthMessage);
}

export function broadcastLogout(): void {
  channel?.postMessage({ type: 'logout' } satisfies AuthMessage);
}

export function broadcastRefresh(expiresIn: number): void {
  channel?.postMessage({ type: 'refresh', expires_in: expiresIn } satisfies AuthMessage);
}

export function closeAuthChannel(): void {
  channel?.close();
  channel = null;
}
