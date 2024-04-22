import Image from "next/image";
import HomeComponent from '@/app/components/Home'
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <HomeComponent></HomeComponent>
    </main>
  );
}
