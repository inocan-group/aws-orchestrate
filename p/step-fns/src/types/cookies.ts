import { CookieSameSite, UtcDateString } from "common-types";

export interface ICookieOptions {
  expires?: UtcDateString;
  maxAge?: number;
  sameSite?: CookieSameSite;
}
