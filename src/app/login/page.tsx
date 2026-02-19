'use client';

import { useState } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { hashPassphrase, passphraseToCredentials } from '@/lib/passphrase-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { KeyRound, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) return;

    if (!isSupabaseConfigured()) {
      setError('서버 설정이 필요합니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const hash = await hashPassphrase(passphrase);
      const { email, password } = passphraseToCredentials(hash);

      // 먼저 로그인 시도
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });

      if (loginError) {
        // 계정 없으면 자동 생성
        const { error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { passphrase_hash: hash.slice(0, 8) } },
        });

        if (signupError) {
          setError('인증에 실패했습니다. 다시 시도해주세요.');
          setLoading(false);
          return;
        }

        // 가입 후 로그인
        const { error: retryError } = await supabase.auth.signInWithPassword({ email, password });
        if (retryError) {
          setError('인증에 실패했습니다. 다시 시도해주세요.');
          setLoading(false);
          return;
        }
      }

      // 성공 — passphrase를 로컬에 저장 (자동 로그인용)
      localStorage.setItem('naengjanggo_passphrase', passphrase.trim().toLowerCase());
      router.push('/');
      router.refresh();
    } catch {
      setError('오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-5">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🧊 냉장고를 부탁해</CardTitle>
          <p className="mt-2 text-sm text-gray-500">
            나만의 비밀문구를 입력하세요<br />
            같은 문구 = 같은 냉장고
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="비밀문구 (예: 우리집냉장고123)"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="pl-9"
                required
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 접속 중...</>
              ) : (
                '냉장고 열기 🚪'
              )}
            </Button>
            <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
              <p className="font-medium text-gray-700">💡 이렇게 작동해요</p>
              <ul className="mt-1 space-y-1">
                <li>• 회원가입 없이 문구만으로 접속</li>
                <li>• 같은 문구를 입력하면 어디서든 내 냉장고</li>
                <li>• 문구를 잊으면 데이터에 접근할 수 없어요</li>
              </ul>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
