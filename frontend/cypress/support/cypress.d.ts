export {};

declare global {
    interface Window {
      __CYPRESS_AUTH__?: boolean;
      _RealWebSocket?: typeof WebSocket;
      __sendMessage?: () => void;
    }
  }