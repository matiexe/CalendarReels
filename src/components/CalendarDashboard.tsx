"use client";

import React, { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { SaveOrderInput, VideoOrderDTO } from "@/types/order";
import { formatCurrency } from "@/lib/utils";
import { StatsCards } from "@/components/StatsCards";
import { OrderModal } from "@/components/OrderModal";
import {
  saveOrderAction,
  deleteOrderAction,
  toggleOrderPaidAction,
} from "@/actions/orders";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  ListFilter,
  Sparkles,
  CheckCircle2,
  Clock,
  Database,
} from "lucide-react";

interface CalendarDashboardProps {
  initialOrders: VideoOrderDTO[];
  storageMode: "supabase" | "local";
}

const STATUS_BADGE: Record<
  VideoOrderDTO["status"],
  { label: string; classes: string; dot: string }
> = {
  PENDING: {
    label: "Pendiente",
    classes: "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/80",
    dot: "bg-amber-500",
  },
  IN_PROGRESS: {
    label: "Grabando",
    classes: "bg-violet-50 text-violet-800 border-violet-200 hover:bg-violet-100/80",
    dot: "bg-violet-500",
  },
  COMPLETED: {
    label: "Entregado",
    classes: "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80",
    dot: "bg-emerald-500",
  },
};

const WEEKDAYS = [
  { short: "Lun", narrow: "L" },
  { short: "Mar", narrow: "M" },
  { short: "Mié", narrow: "X" },
  { short: "Jue", narrow: "J" },
  { short: "Vie", narrow: "V" },
  { short: "Sáb", narrow: "S" },
  { short: "Dom", narrow: "D" },
];

export function CalendarDashboard({
  initialOrders,
  storageMode,
}: CalendarDashboardProps) {
  const [orders, setOrders] = useState<VideoOrderDTO[]>(initialOrders);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() =>
    format(new Date(), "yyyy-MM-dd")
  );
  const [editingOrder, setEditingOrder] = useState<VideoOrderDTO | null>(null);

  const monthLabel = useMemo(() => {
    const raw = format(currentMonth, "MMMM yyyy", { locale: es });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [currentMonth]);

  const selectedDayLabel = useMemo(() => {
    const raw = format(selectedDay, "EEEE d 'de' MMMM", { locale: es });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [selectedDay]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const monthOrders = useMemo(() => {
    return orders
      .filter((order) => isSameMonth(parseISO(order.scheduledAt), currentMonth))
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
  }, [orders, currentMonth]);

  const selectedDayOrders = useMemo(() => {
    return orders.filter((order) =>
      isSameDay(parseISO(order.scheduledAt), selectedDay)
    );
  }, [orders, selectedDay]);

  const handleOpenNewForDate = (date: Date) => {
    setSelectedDay(date);
    setEditingOrder(null);
    setSelectedDateStr(format(date, "yyyy-MM-dd"));
    setModalOpen(true);
  };

  const handleDayCellClick = (day: Date) => {
    setSelectedDay(day);
    if (typeof window !== "undefined" && window.innerWidth >= 640) {
      handleOpenNewForDate(day);
    }
  };

  const handleOpenEditOrder = (order: VideoOrderDTO, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingOrder(order);
    setSelectedDateStr(order.scheduledAt.slice(0, 10));
    setModalOpen(true);
  };

  const handleQuickTogglePaid = async (
    order: VideoOrderDTO,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const nextPaid = !order.isPaid;
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, isPaid: nextPaid } : o))
    );
    const updated = await toggleOrderPaidAction(order.id, nextPaid);
    if (updated) {
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o))
      );
    }
  };

  const handleSaveOrder = async (input: SaveOrderInput) => {
    const saved = await saveOrderAction(input);
    setOrders((prev) => {
      const exists = prev.some((o) => o.id === saved.id);
      if (exists) {
        return prev.map((o) => (o.id === saved.id ? saved : o));
      }
      return [...prev, saved];
    });
  };

  const handleDeleteOrder = async (id: string) => {
    await deleteOrderAction(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-24 sm:pb-14">
      {/* Header Adaptado a Móvil y Escritorio */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3.5 py-3 sm:px-6 sm:py-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 text-white shadow-xs sm:h-10 sm:w-10 sm:rounded-2xl">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-xl">
                  CalendarReels
                </h1>
                <span className="hidden items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 sm:inline-flex">
                  <Database className="h-3 w-3" />
                  {storageMode === "supabase" ? "Supabase" : "Modo Local"}
                </span>
              </div>
              <p className="hidden text-xs text-slate-500 sm:block">
                Agenda tus pedidos de videos y lleva el control de tus precios e ingresos
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-0.5 sm:p-1">
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 ${
                  viewMode === "calendar"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>Calendario</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 ${
                  viewMode === "list"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ListFilter className="h-3.5 w-3.5" />
                <span>Precios</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleOpenNewForDate(selectedDay)}
              className="hidden items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-violet-700 sm:inline-flex"
            >
              <Plus className="h-4 w-4" />
              Nuevo Pedido
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-4 px-3.5 pt-4 sm:space-y-6 sm:px-6 sm:pt-6 lg:px-8">
        {/* Resumen Financiero 2x2 en móvil / 4 col en escritorio */}
        <StatsCards monthOrders={monthOrders} monthLabel={monthLabel} />

        {/* Barra de Navegación del Mes */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-2xs sm:px-5 sm:py-3.5">
          <div className="flex w-full items-center justify-between sm:w-auto sm:justify-start sm:gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 active:scale-95"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h2 className="min-w-[140px] text-center text-base font-bold text-slate-900 sm:min-w-[170px] sm:text-lg">
                {monthLabel}
              </h2>
              <button
                type="button"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 active:scale-95"
                aria-label="Mes siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setCurrentMonth(now);
                setSelectedDay(now);
              }}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Hoy
            </button>
          </div>

          <div className="hidden flex-wrap items-center gap-4 text-xs text-slate-600 sm:flex">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              Pendiente
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
              Grabando / Editando
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Entregado
            </span>
          </div>
        </div>

        {/* Vista de Calendario */}
        {viewMode === "calendar" ? (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              {/* Encabezado 7 columnas siempre alineado */}
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day.short}
                    className="py-2.5 text-center text-[11px] font-semibold tracking-wider text-slate-500 uppercase sm:py-3 sm:text-xs"
                  >
                    <span className="sm:hidden">{day.narrow}</span>
                    <span className="hidden sm:inline">{day.short}</span>
                  </div>
                ))}
              </div>

              {/* Grilla 7 columnas tanto en móvil como en escritorio */}
              <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 sm:divide-slate-200">
                {calendarDays.map((day) => {
                  const dayOrders = orders.filter((o) =>
                    isSameDay(parseISO(o.scheduledAt), day)
                  );
                  const inCurrentMonth = isSameMonth(day, currentMonth);
                  const todayFlag = isToday(day);
                  const isSelectedMobile = isSameDay(day, selectedDay);
                  const dayTotal = dayOrders.reduce((sum, o) => sum + o.price, 0);

                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => handleDayCellClick(day)}
                      className={`group flex min-h-[64px] cursor-pointer flex-col justify-between p-1.5 transition sm:min-h-[135px] sm:p-2.5 ${
                        isSelectedMobile
                          ? "bg-violet-50/70 sm:bg-white"
                          : inCurrentMonth
                          ? "bg-white hover:bg-slate-50/70"
                          : "bg-slate-50/40 text-slate-400 hover:bg-slate-100/50"
                      }`}
                    >
                      {/* Cabecera del día */}
                      <div className="flex flex-col items-center sm:mb-2 sm:flex-row sm:justify-between">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition sm:h-7 sm:w-7 ${
                            todayFlag
                              ? "bg-violet-600 text-white shadow-2xs"
                              : isSelectedMobile
                              ? "bg-violet-100 font-bold text-violet-800 sm:bg-transparent sm:text-slate-700"
                              : inCurrentMonth
                              ? "text-slate-700"
                              : "text-slate-400"
                          }`}
                        >
                          {format(day, "d")}
                        </span>

                        <div className="hidden items-center gap-1 sm:flex">
                          {dayTotal > 0 && (
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                              {formatCurrency(dayTotal)}
                            </span>
                          )}
                          <span className="opacity-0 transition group-hover:opacity-100">
                            <Plus className="h-4 w-4 text-violet-500" />
                          </span>
                        </div>
                      </div>

                      {/* Indicadores compactos en móvil (dots + precio compacto) */}
                      <div className="flex flex-col items-center gap-1 sm:hidden">
                        {dayOrders.length > 0 && (
                          <>
                            <div className="flex items-center justify-center gap-1">
                              {dayOrders.slice(0, 3).map((o) => (
                                <span
                                  key={o.id}
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    STATUS_BADGE[o.status].dot
                                  }`}
                                />
                              ))}
                              {dayOrders.length > 3 && (
                                <span className="text-[9px] font-bold text-slate-400">
                                  +{dayOrders.length - 3}
                                </span>
                              )}
                            </div>
                            <span className="max-w-full truncate rounded bg-slate-100 px-1 py-0.2 text-[9px] font-bold text-slate-700">
                              ${Math.round(dayTotal).toLocaleString("es-AR")}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Tarjetas completas en escritorio */}
                      <div className="hidden space-y-1.5 sm:block">
                        {dayOrders.map((order) => {
                          const badge = STATUS_BADGE[order.status];
                          return (
                            <div
                              key={order.id}
                              onClick={(e) => handleOpenEditOrder(order, e)}
                              className={`rounded-xl border p-2 text-left transition shadow-2xs ${badge.classes}`}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <span className="line-clamp-1 text-xs font-bold">
                                  {order.title}
                                </span>
                                <span className="shrink-0 rounded-md bg-white/90 px-1.5 py-0.5 text-[11px] font-bold text-slate-900 shadow-2xs">
                                  {formatCurrency(order.price)}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center justify-between text-[10px] opacity-90">
                                <span className="truncate font-medium">
                                  {order.clientName} · {order.platform}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => handleQuickTogglePaid(order, e)}
                                  title="Cambiar estado de pago"
                                  className={`shrink-0 rounded px-1 py-0.5 font-bold transition ${
                                    order.isPaid
                                      ? "bg-emerald-600/15 text-emerald-800 hover:bg-emerald-600/25"
                                      : "bg-amber-600/15 text-amber-900 hover:bg-amber-600/25"
                                  }`}
                                >
                                  {order.isPaid ? "✓ Pagado" : "Por cobrar"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Panel de Agenda del Día Seleccionado (Especial para Móvil) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <p className="text-[11px] font-semibold tracking-wider text-violet-600 uppercase">
                    Agenda del día
                  </p>
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedDayLabel}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenNewForDate(selectedDay)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 transition active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agendar aquí
                </button>
              </div>

              {selectedDayOrders.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-xs text-slate-500">
                    No hay videos programados para este día.
                  </p>
                </div>
              ) : (
                <div className="mt-3 space-y-2.5">
                  {selectedDayOrders.map((order) => {
                    const badge = STATUS_BADGE[order.status];
                    return (
                      <div
                        key={order.id}
                        onClick={() => handleOpenEditOrder(order)}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 active:bg-slate-100"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${badge.dot}`}
                            />
                            <h4 className="truncate text-sm font-bold text-slate-900">
                              {order.title}
                            </h4>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {order.clientName} ·{" "}
                            <span className="font-medium text-slate-700">
                              {order.platform}
                            </span>
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span className="text-sm font-bold text-slate-900">
                            {formatCurrency(order.price)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleQuickTogglePaid(order, e)}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              order.isPaid
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {order.isPaid ? (
                              <>
                                <CheckCircle2 className="h-3 w-3" /> Pagado
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3" /> Por cobrar
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Vista de Lista de Pedidos y Precios */
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            {monthOrders.length === 0 ? (
              <div className="p-10 text-center sm:p-12">
                <p className="text-sm font-medium text-slate-600">
                  No hay pedidos agendados en {monthLabel}.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenNewForDate(currentMonth)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-700"
                >
                  <Plus className="h-4 w-4" />
                  Agregar primer pedido del mes
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {monthOrders.map((order) => {
                  const badge = STATUS_BADGE[order.status];
                  return (
                    <div
                      key={order.id}
                      onClick={() => handleOpenEditOrder(order)}
                      className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-slate-50 sm:px-6 sm:py-4"
                    >
                      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 sm:h-12 sm:w-12">
                          <span className="text-[10px] font-semibold uppercase">
                            {format(parseISO(order.scheduledAt), "MMM", { locale: es })}
                          </span>
                          <span className="text-sm font-bold leading-none sm:text-base">
                            {format(parseISO(order.scheduledAt), "dd")}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-sm font-bold text-slate-900">
                              {order.title}
                            </h3>
                            <span className="hidden rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 sm:inline-block">
                              {order.platform}
                            </span>
                          </div>
                          <p className="truncate text-xs text-slate-500">
                            <strong className="text-slate-700">{order.clientName}</strong>{" "}
                            <span className="sm:hidden">· {order.platform}</span>
                            {order.description ? ` — ${order.description}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                        <span
                          className={`hidden items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold sm:inline-flex ${badge.classes}`}
                        >
                          <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>

                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900 sm:text-base">
                            {formatCurrency(order.price)}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => handleQuickTogglePaid(order, e)}
                            className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold transition ${
                              order.isPaid
                                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                            }`}
                          >
                            {order.isPaid ? (
                              <>
                                <CheckCircle2 className="h-3 w-3" /> Pagado
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3" /> Por cobrar
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Botón Flotante (FAB) en Zona del Pulgar para Móvil */}
      <button
        type="button"
        onClick={() => handleOpenNewForDate(selectedDay)}
        aria-label="Nuevo pedido de video"
        className="fixed right-5 bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-pink-500 text-white shadow-lg shadow-violet-600/30 transition active:scale-95 sm:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>

      <OrderModal
        isOpen={modalOpen}
        initialDate={selectedDateStr}
        editingOrder={editingOrder}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveOrder}
        onDelete={handleDeleteOrder}
      />
    </div>
  );
}
