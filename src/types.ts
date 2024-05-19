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

export type PaginationMeta = {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
};
