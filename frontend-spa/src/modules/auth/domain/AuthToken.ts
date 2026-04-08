/**
 * Value Object — represents an access token.
 * Immutable. No identity (two tokens with the same value are equal).
 */
export class AuthToken {
  readonly value: string;

  constructor(value: string) {
    if (!value.trim()) throw new Error('AuthToken: value cannot be empty');
    this.value = value;
  }

  equals(other: AuthToken): boolean {
    return this.value === other.value;
  }
}
