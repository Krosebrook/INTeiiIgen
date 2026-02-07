declare namespace Express {
  interface User {
    claims: {
      sub: string;
      email?: string;
      first_name?: string;
      last_name?: string;
    };
  }
}
