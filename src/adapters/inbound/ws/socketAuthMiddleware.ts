import { Socket } from "socket.io";
import { type TokenService } from "../../../core/application/ports/TokenService.js";

export function buildSocketAuthMiddleware(tokens: TokenService) {
  return (socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("missing_token"));

    try {
      socket.data.auth = tokens.verify(token);
      next();
    } catch (e) {
      next(new Error("invalid_token"));
    }
  };
}