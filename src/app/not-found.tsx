import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px',
        background: 'var(--n-canvas)',
        gap: '12px',
      }}
    >
      <FileQuestion
        size={48}
        style={{ color: 'var(--n-ink-25)', flexShrink: 0 }}
      />
      <p
        style={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--n-ink)',
          letterSpacing: '-0.3px',
          margin: 0,
        }}
      >
        페이지를 찾을 수 없습니다
      </p>
      <p
        style={{
          fontSize: '13px',
          color: 'var(--n-ink-45)',
          margin: 0,
          textAlign: 'center',
          lineHeight: 1.5,
          maxWidth: '280px',
        }}
      >
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <Link
        href="/"
        style={{
          marginTop: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '280px',
          height: '44px',
          background: 'var(--n-ink)',
          color: '#ffffff',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 600,
          textDecoration: 'none',
          letterSpacing: '-0.1px',
        }}
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
