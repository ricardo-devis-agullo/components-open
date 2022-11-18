type Subscription<T = any> = (data: T) => void;
let subscriptions: Record<string, Array<Subscription>> = {};

export interface RequestData {
  body: unknown;
  duration: number;
  headers: Request['headers'];
  method: string;
  path: string;
  relativeUrl: string;
  query: Record<string, unknown>;
  url: string;
  statusCode: number;
  errorDetails?: string;
  errorCode?: string;
}

type Events = {
  error: { code: string; message: string };
  start: unknown;
  'cache-poll': number;
  request: RequestData;
  'component-retrieved': {
    headers: Request['headers'];
    name: string;
    parameters: Record<string, string>;
    requestVersion: string;
    duration: number;
  };
};

type EventsHandler = {
  fire<T extends keyof Events>(eventName: T, data: Events[T]): void;
  on<T extends keyof Events>(eventName: T, listener: Subscription<Events[T]>): void;
  off<T extends keyof Events>(eventName: T, listener: Subscription<Events[T]>): void;
  reset(): void;
};

export const eventsHandler: EventsHandler = {
  fire(eventName: string, eventData: unknown): void {
    if (subscriptions[eventName]) {
      subscriptions[eventName].forEach((callback) => {
        callback(eventData);
      });
    }
  },

  on(eventName: string, callback: Subscription): void {
    if (typeof callback !== 'function') {
      throw 'CONFIGURATION_ONREQUEST_MUST_BE_FUNCTION';
    }

    if (!subscriptions[eventName]) {
      subscriptions[eventName] = [];
    }

    subscriptions[eventName].push(callback);
  },

  off(eventName: string, callback: Subscription): void {
    if (typeof callback !== 'function') {
      throw 'CONFIGURATION_OFFREQUEST_MUST_BE_FUNCTION';
    }

    if (subscriptions[eventName]) {
      subscriptions[eventName] = subscriptions[eventName].filter((sub) => sub !== callback);
    }
  },

  reset(): void {
    subscriptions = {};
  },
};

export default eventsHandler;
