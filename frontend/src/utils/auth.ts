import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  id: number;
  username: string;
  isAdmin: boolean;
}

export const isTokenValid = (token: string): boolean => {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    return decoded.exp * 1000 > Date.now(); // exp is in seconds, Date.now() is ms
  } catch {
    return false;
  }
};

export const getUserFromToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch {
    return null;
  }
};