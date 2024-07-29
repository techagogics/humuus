import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex h-screen">
      <Button size="lg" variant="primary" className="m-auto" asChild>
        <Link href="/game">Join the Game!</Link>
      </Button>
    </div>
  );
}
