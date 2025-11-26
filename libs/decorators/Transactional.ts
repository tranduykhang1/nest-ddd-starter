import { ICommandHandler, IEventHandler } from '@nestjs/cqrs';

export function Transactional() {
  return (
    target: ICommandHandler | IEventHandler,
    key: string,
    descriptor: PropertyDescriptor,
  ): void => {
    const originalMethod = descriptor.value as (
      ...args: unknown[]
    ) => Promise<unknown>;
    descriptor.value = new Proxy(originalMethod, {
      apply: async (proxyTarget, thisArg, args) => {
        // MongoDB transactions require replica set
        // For now, just execute the method without transaction wrapper
        // To enable transactions, configure MongoDB replica set and inject Mongoose session
        return proxyTarget.apply(thisArg, args);
      },
    });
  };
}
