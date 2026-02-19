// Passphrase 기반 인증
// passphrase → SHA-256 해시 → 결정적 이메일/비밀번호 생성 → Supabase 자동 가입/로그인

export async function hashPassphrase(passphrase: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(passphrase.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function passphraseToCredentials(hash: string) {
  return {
    email: `${hash.slice(0, 32)}@fridge.naengjanggo.app`,
    password: `np_${hash}`,
  };
}
