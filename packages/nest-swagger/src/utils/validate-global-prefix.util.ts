export const validateGlobalPrefix = (globalPrefix: string): boolean =>
  Boolean(globalPrefix) && globalPrefix !== '/';
