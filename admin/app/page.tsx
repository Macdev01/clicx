import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/clixxx-logo.svg"
          alt="clixxx logo"
          width={180}
          height={38}
          priority
        />
        <Image
          className="dark:invert"
          src="/women.png"
          alt="women"
          width={180}
          height={38}
          priority
        />
  </main>
    </div>
  );
}
