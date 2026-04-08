/**
 * Contract for token persistence.
 * Domain defines WHAT is needed — infrastructure decides HOW.
 */
export interface ITokenStorage {
  save(token: string): void;
  get(): string | null;
  clear(): void;
}
