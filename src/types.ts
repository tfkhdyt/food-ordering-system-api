export type MessageResponse = {
  message: string;
  statusCode: number;
};

export type JWTPayload = {
  sub: number;
  username: string;
  role: 'user' | 'customer';
  exp: number;
};
