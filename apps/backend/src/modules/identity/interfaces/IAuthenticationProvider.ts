export interface UserIdentity {
  sub: string; // The subject/ID from the identity provider
  email: string;
  name?: string;
  tenantId?: string; // e.g. organization if provided in token
}

export interface IAuthenticationProvider {
  /**
   * Verifies an incoming token (e.g., JWT from Authorization header)
   * against the identity provider and returns the user identity if valid.
   * Throws an error if invalid.
   */
  verifyToken(token: string): Promise<UserIdentity>;
}
