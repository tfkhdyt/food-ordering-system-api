export type MessageResponse = {
  message: string;
  statusCode: number;
};

export type JWTPayload = {
  sub: string;
  username: string;
  role: 'user' | 'customer';
  exp: number;
};
