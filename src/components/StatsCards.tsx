import { VideoOrderDTO } from "@/types/order";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, CheckCircle2, Clock, Video } from "lucide-react";

interface StatsCardsProps {
  monthOrders: VideoOrderDTO[];
  monthLabel: string;
}

export function StatsCards({ monthOrders, monthLabel }: StatsCardsProps) {
  const totalMonthPrice = monthOrders.reduce((acc, item) => acc + item.price, 0);
  const paidMonthPrice = monthOrders
    .filter((item) => item.isPaid)
    .reduce((acc, item) => acc + item.price, 0);
  const pendingMonthPrice = totalMonthPrice - paidMonthPrice;
  const completedCount = monthOrders.filter((item) => item.status === "COMPLETED").length;

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs sm:p-5">
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-xs font-medium text-slate-500 sm:text-sm">
            Total ({monthLabel.split(" ")[0]})
          </span>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 sm:h-9 sm:w-9 sm:rounded-xl">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
        <p className="mt-2 text-lg font-bold tracking-tight text-slate-900 sm:mt-3 sm:text-2xl">
          {formatCurrency(totalMonthPrice)}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:mt-1 sm:text-xs">
          {monthOrders.length} {monthOrders.length === 1 ? "video" : "videos"} en el mes
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs sm:p-5">
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-xs font-medium text-slate-500 sm:text-sm">
            Cobrado
          </span>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 sm:h-9 sm:w-9 sm:rounded-xl">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
        <p className="mt-2 text-lg font-bold tracking-tight text-emerald-600 sm:mt-3 sm:text-2xl">
          {formatCurrency(paidMonthPrice)}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:mt-1 sm:text-xs">
          Pagos confirmados
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs sm:p-5">
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-xs font-medium text-slate-500 sm:text-sm">
            Por Cobrar
          </span>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 sm:h-9 sm:w-9 sm:rounded-xl">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
        <p className="mt-2 text-lg font-bold tracking-tight text-amber-600 sm:mt-3 sm:text-2xl">
          {formatCurrency(pendingMonthPrice)}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:mt-1 sm:text-xs">
          Pendiente de abono
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs sm:p-5">
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-xs font-medium text-slate-500 sm:text-sm">
            Entregas
          </span>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-pink-100 text-pink-600 sm:h-9 sm:w-9 sm:rounded-xl">
            <Video className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
        <p className="mt-2 text-lg font-bold tracking-tight text-slate-900 sm:mt-3 sm:text-2xl">
          {completedCount}{" "}
          <span className="text-sm font-normal text-slate-400 sm:text-base">
            / {monthOrders.length}
          </span>
        </p>
        <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:mt-1 sm:text-xs">
          Videos listos
        </p>
      </div>
    </div>
  );
}
