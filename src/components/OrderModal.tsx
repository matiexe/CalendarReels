"use client";

import React, { useEffect, useState } from "react";
import { OrderStatus, SaveOrderInput, VideoOrderDTO } from "@/types/order";
import { X, Trash2, DollarSign, Calendar, User, Film, FileText, Check } from "lucide-react";

interface OrderModalProps {
  isOpen: boolean;
  initialDate: string; // YYYY-MM-DD
  editingOrder: VideoOrderDTO | null;
  onClose: () => void;
  onSave: (data: SaveOrderInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const PLATFORMS = ["Reels", "TikTok", "YouTube Shorts", "UGC Ads", "Otro"];

export function OrderModal({
  isOpen,
  initialDate,
  editingOrder,
  onClose,
  onSave,
  onDelete,
}: OrderModalProps) {
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [platform, setPlatform] = useState("Reels");
  const [scheduledAt, setScheduledAt] = useState(initialDate);
  const [price, setPrice] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [status, setStatus] = useState<OrderStatus>("PENDING");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingOrder) {
      setTitle(editingOrder.title);
      setClientName(editingOrder.clientName);
      setPlatform(editingOrder.platform || "Reels");
      setScheduledAt(editingOrder.scheduledAt.slice(0, 10));
      setPrice(String(editingOrder.price));
      setIsPaid(editingOrder.isPaid);
      setStatus(editingOrder.status);
      setDescription(editingOrder.description || "");
    } else {
      setTitle("");
      setClientName("");
      setPlatform("Reels");
      setScheduledAt(initialDate);
      setPrice("");
      setIsPaid(false);
      setStatus("PENDING");
      setDescription("");
    }
  }, [editingOrder, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientName.trim() || !scheduledAt) return;

    setIsSubmitting(true);
    try {
      await onSave({
        id: editingOrder?.id,
        title,
        clientName,
        platform,
        scheduledAt,
        price: parseFloat(price || "0"),
        isPaid,
        status,
        description,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingOrder) return;
    setIsSubmitting(true);
    try {
      await onDelete(editingOrder.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:max-h-[90dvh] sm:rounded-2xl"
      >
        {/* Indicador superior tipo Bottom Sheet en móvil */}
        <div className="flex justify-center pt-2.5 sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-slate-200" />
        </div>

        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5 sm:px-6 sm:py-4">
          <div>
            <h2 id="order-modal-title" className="text-base font-bold text-slate-900 sm:text-lg">
              {editingOrder ? "Editar Pedido de Video" : "Nuevo Pedido de Video"}
            </h2>
            <p className="text-xs text-slate-500">
              Agenda el pedido en el calendario y registra el precio del video
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Film className="h-3.5 w-3.5 text-violet-600" />
                Título o idea del video *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Reel Unboxing Colección Verano"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-base text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 sm:py-2.5 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <User className="h-3.5 w-3.5 text-violet-600" />
                  Cliente / Marca *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Glow Cosmetics"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-base text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 sm:py-2.5 sm:text-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Formato / Plataforma
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-base text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 sm:py-2.5 sm:text-sm"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Calendar className="h-3.5 w-3.5 text-violet-600" />
                  Fecha *
                </label>
                <input
                  type="date"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-base text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 sm:px-3.5 sm:py-2.5 sm:text-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                  Precio ($) *
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-semibold text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-3 pr-3.5 pl-8 text-base font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 sm:py-2.5 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Estado del video
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-base text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 sm:py-2.5 sm:text-sm"
                >
                  <option value="PENDING">⏳ Pendiente por grabar</option>
                  <option value="IN_PROGRESS">🎬 Grabando / Editando</option>
                  <option value="COMPLETED">✅ Video Entregado</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => setIsPaid(!isPaid)}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border px-3.5 py-3 text-sm font-semibold transition sm:py-2.5 ${
                    isPaid
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      isPaid
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isPaid && <Check className="h-3 w-3" />}
                  </span>
                  {isPaid ? "Pago recibido" : "Marcar como pagado"}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <FileText className="h-3.5 w-3.5 text-violet-600" />
                Notas del guion / Detalles del pedido
              </label>
              <textarea
                rows={2}
                placeholder="Ideas de tomas, música, duración, referencias..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-base text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-white px-5 py-3.5 sm:px-6 sm:py-4">
            {editingOrder ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-violet-700 disabled:opacity-50"
              >
                {isSubmitting
                  ? "Guardando..."
                  : editingOrder
                  ? "Guardar Cambios"
                  : "Agendar Video"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
