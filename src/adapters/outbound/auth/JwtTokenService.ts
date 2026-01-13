import jwt from "jsonwebtoken";

export class JwtTokenService {
  constructor(private secret: string) {}

  signAdmin(userId: string) {
    return jwt.sign({ role: "admin", userId }, this.secret, { expiresIn: "15m" });
  }

  signUser(sessionId: string) {
    return jwt.sign({ role: "user", sessionId }, this.secret, { expiresIn: "2h" });
  }

  verify(token: string) {
    return jwt.verify(token, this.secret) as any;
  }
}