import { User } from "src/core";
import { Session } from "src/usecases/session/entities/session.entity";

export type JwtPayloadType = Pick<User, 'id'> & {
  sessionId: Session['id'];
  iat: number;
  exp: number;
};
