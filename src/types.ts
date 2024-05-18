export type MessageResponse = {
  message: string;
  statusCode: number;
};

export type JWTPayload = {
  sub: Buffer;
  username: string;
  role: 'user' | 'customer';
  exp: number;
};
