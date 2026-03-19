"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import type { CoinPrice } from "@/entities/crypto/types";
import { formatKrw, formatUsd } from "@/shared/lib/functions";
import { SvgIcon } from "@/shared/ui";

interface PropType {
  coins: CoinPrice[];
}

const AUTOPLAY_DELAY_MS = 5000;

export function CoinBannerCarousel({ coins }: PropType) {
  const [isPaused, setIsPaused] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true
  });

  useEffect(() => {
    if (!emblaApi || coins.length <= 1 || isPaused) return;

    const intervalId = window.setInterval(() => {
      emblaApi.scrollNext();
    }, AUTOPLAY_DELAY_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [coins.length, emblaApi, isPaused]);

  return (
    <div
      className="relative px-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <button
        type="button"
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute left-[calc(1.5rem-4px)] top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700/70 bg-slate-800/95 text-white shadow-[0_12px_30px_rgba(15,23,42,0.45)] transition-colors hover:bg-slate-700/95"
        aria-label="이전 코인 보기"
      >
        <SvgIcon name="chevronLeft" className="h-5 w-5" />
      </button>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="-ml-4 flex">
          {coins.map((coin) => (
            <div
              key={coin.symbol}
              className="min-w-0 flex-[0_0_100%] pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.3333%] 2xl:flex-[0_0_25%]"
            >
              <div className="h-full rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 text-center backdrop-blur-sm">
                <div className="flex items-center justify-center gap-3">
                  <Image
                    src={coin.image}
                    width={28}
                    height={28}
                    alt={`${coin.name} logo`}
                    className="rounded-full"
                  />
                  <div className="text-left">
                    <p className="text-lg font-semibold text-white">{coin.name}</p>
                  </div>
                </div>
                <div className="mt-5 rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-400/10 px-4 py-5">
                  <p className="text-2xl font-bold text-blue-300">{formatKrw(coin.price_krw)}</p>
                  <p className="mt-2 text-lg font-semibold text-cyan-300">
                    ${formatUsd(coin.price_usd, 2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => emblaApi?.scrollNext()}
        className="absolute right-[calc(1.5rem-4px)] top-1/2 z-10 flex h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700/70 bg-slate-800/95 text-white shadow-[0_12px_30px_rgba(15,23,42,0.45)] transition-colors hover:bg-slate-700/95"
        aria-label="다음 코인 보기"
      >
        <SvgIcon name="chevronRight" className="h-5 w-5" />
      </button>
    </div>
  );
}
