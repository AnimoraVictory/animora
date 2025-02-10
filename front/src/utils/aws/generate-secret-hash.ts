import CryptoJS from "crypto-js";

const CLIENT_ID = import.meta.env.VITE_AWS_CLIENT_ID as string;
const CLIENT_SECRET = import.meta.env.VITE_AWS_COGNITO_CLIENT_SECRET as string;

export const generateSecretHash = (username: string): string => {
  const message = `${username}${CLIENT_ID}`;
  return CryptoJS.HmacSHA256(message, CLIENT_SECRET).toString(CryptoJS.enc.Base64);
};
