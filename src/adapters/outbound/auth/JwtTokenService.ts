import jwt from "jsonwebtoken";

type TokenPayload =
  | {role: "user"; sessionId: string}
  | {role: "admin"; panelUserId: string; panelRole: "ADMIN" | "USER"}


export class JwtTokenService {
  constructor(private secret: string) {}

  signPanelUser(panelUserId: string, panelRole: "ADMIN" | "USER") {
    return jwt.sign(
      { role: "admin", panelUserId, panelRole } satisfies TokenPayload,
      this.secret,
      { expiresIn: "8h" }
    );
  }

  signUser(guestId: string) {
    return jwt.sign({ role: "user", sessionId: guestId } satisfies TokenPayload, this.secret, { expiresIn: "30m" });
  }

  verify(token: string): TokenPayload {
    const signedtoken = jwt.verify(token, this.secret) as TokenPayload;
    return signedtoken;
  }
}