import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; //signature, yg ngesign akses

export interface UserPayload {
    id: number;
}

//pertama ngasih token
export function signToken(payload: UserPayload) {
    return jwt.sign(payload, JWT_SECRET, {expiresIn: "1d"});
}

//kedua, verify tokennya bener atau engga
export function verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
}
