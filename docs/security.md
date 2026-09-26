# TrustFace AI — Security & Privacy Architecture

## 1. Biometric Data Ephemerality
- TrustFace AI does not store user uploaded biometric pictures or camera captures to persistent disk or cloud storage.
- All tensors and matrices are stored strictly in volatile RAM and dereferenced upon response serialization.
- Garbage collection is forced during high-throughput requests.

## 2. Server-Side Authority
- Verification verdicts (`REAL`, `POTENTIAL MANIPULATION`, `UNCERTAIN`) and confidence scores are calculated exclusively on the backend.
- The React client only renders what the cryptographically verified analysis response delivers. Client-side tampering of HTML or JavaScript cannot alter audit logging.

## 3. Upload Safeguards
- **MIME & Magic Number Verification**: File headers are validated against binary signatures for JPEG (`FF D8 FF`), PNG (`89 50 4E 47`), and WebP (`52 49 46 46`).
- **File Size Ceiling**: Default 10 MB strict limit to prevent memory exhaustion and DoS attacks.
- **Decompression Bomb Protection**: Pillow safety limits (`Image.MAX_IMAGE_PIXELS`) prevent pixel-flood vulnerabilities.
- **CORS & Origin Hardening**: Explicit origin controls configured via environment variables.
