import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export function signJwt(
  payload: object,
  expiresIn: SignOptions["expiresIn"] = "1h"
): string {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET, options);
}

function base64UrlDecode(str: string): string {
  // Add padding if needed
  str += '='.repeat((4 - str.length % 4) % 4);
  // Replace URL-safe characters
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  return atob(base64);
}

// HMAC SHA256 function using Web Crypto API
async function hmacSha256(key: string, data: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  return crypto.subtle.sign('HMAC', cryptoKey, messageData);
}

// Base64URL encode function
function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function verifyJwt<T extends object>(token: string): Promise<T | null> {
  try {
    if (!token) {
      console.log("No token provided");
      return null;
    }
    
    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return null;
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log("Invalid token format");
      return null;
    }
    
    const [header, payload, signature] = parts;
    
    // Decode and parse header
    const decodedHeader = JSON.parse(base64UrlDecode(header));
    if (decodedHeader.alg !== 'HS256') {
      console.log("Unsupported algorithm:", decodedHeader.alg);
      return null;
    }
    
    // Verify signature
    const data = `${header}.${payload}`;
    const expectedSignatureBuffer = await hmacSha256(JWT_SECRET, data);
    const expectedSignature = base64UrlEncode(expectedSignatureBuffer);
    
    if (signature !== expectedSignature) {
      console.log("Invalid signature");
      return null;
    }
    
    // Decode and parse payload
    const decodedPayload = JSON.parse(base64UrlDecode(payload));
    
    // Check expiration
    if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
      console.log("Token has expired");
      return null;
    }
    
    // Check not before
    if (decodedPayload.nbf && Date.now() < decodedPayload.nbf * 1000) {
      console.log("Token not active yet");
      return null;
    }
    
    console.log("Token successfully decoded:", decodedPayload);
    return decodedPayload as T;
    
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}