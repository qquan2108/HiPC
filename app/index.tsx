// app/index.tsx
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export default function Index() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Đợi đến khi app mount đầy đủ rồi mới điều hướng
    const timeout = setTimeout(() => {
      setIsReady(true);
    }, 100); // 100ms delay nhỏ để đảm bảo Root Layout đã render
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isReady) {
      router.replace('./hipc');
    }
  }, [isReady]);

  return null;
}
