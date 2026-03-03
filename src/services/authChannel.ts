export type AuthMessage = { type: 'login' } | { type: 'logout' };

let channel: BroadcastChannel | null = null;

export function initAuthChannel(onMessage: (msg: AuthMessage) => void): void {
  if (typeof BroadcastChannel === 'undefined') return;
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

export function closeAuthChannel(): void {
  channel?.close();
  channel = null;
}
