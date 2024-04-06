export type MessageResponse = {
  message: string;
  statusCode: number;
};

export type JWTPayload = {
  sub: number;
  username: string;
  exp: number;
};
