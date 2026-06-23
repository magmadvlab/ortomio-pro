// app/farm/page.tsx
import { FarmCommandCenter } from '@/components/farm/FarmCommandCenter';

export default function FarmPage() {
  return (
    <main className="p-4 h-[calc(100vh-4rem)]">
      <FarmCommandCenter />
    </main>
  );
}
