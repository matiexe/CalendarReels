"use server";

import { revalidatePath } from "next/cache";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { SaveOrderInput, VideoOrderDTO } from "@/types/order";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const LOCAL_DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_DATA_FILE = path.join(LOCAL_DATA_DIR, "orders.json");

function getInitialSampleOrders(): VideoOrderDTO[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return [
    {
      id: "sample-1",
      title: "Reel Unboxing Kit Skincare",
      clientName: "Glow Beauty Co.",
      platform: "Reels",
      description: "Video de 45s mostrando textura y aplicación con luz natural.",
      scheduledAt: `${year}-${month}-08T12:00:00.000Z`,
      price: 25000,
      isPaid: true,
      status: "COMPLETED",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: "sample-2",
      title: "Pack 2 Videos UGC App Fitness",
      clientName: "FitPulse App",
      platform: "TikTok",
      description: "Gancho en los primeros 3 segundos entrenando en casa.",
      scheduledAt: `${year}-${month}-15T12:00:00.000Z`,
      price: 45000,
      isPaid: false,
      status: "IN_PROGRESS",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: "sample-3",
      title: "Review Cafetera Express",
      clientName: "Aroma Café",
      platform: "Reels",
      description: "Transiciones dinámicas preparando un latte helado.",
      scheduledAt: `${year}-${month}-22T12:00:00.000Z`,
      price: 30000,
      isPaid: false,
      status: "PENDING",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];
}

async function readLocalOrders(): Promise<VideoOrderDTO[]> {
  try {
    const raw = await fs.readFile(LOCAL_DATA_FILE, "utf-8");
    return JSON.parse(raw) as VideoOrderDTO[];
  } catch {
    const initial = getInitialSampleOrders();
    await fs.mkdir(LOCAL_DATA_DIR, { recursive: true });
    await fs.writeFile(LOCAL_DATA_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
}

async function writeLocalOrders(orders: VideoOrderDTO[]): Promise<void> {
  await fs.mkdir(LOCAL_DATA_DIR, { recursive: true });
  await fs.writeFile(LOCAL_DATA_FILE, JSON.stringify(orders, null, 2), "utf-8");
}

export async function getOrdersAction(): Promise<{
  orders: VideoOrderDTO[];
  storageMode: "supabase" | "local";
}> {
  if (isDatabaseConfigured && prisma) {
    const records = await prisma.videoOrder.findMany({
      orderBy: { scheduledAt: "asc" },
    });

    const orders: VideoOrderDTO[] = records.map((r) => ({
      id: r.id,
      title: r.title,
      clientName: r.clientName,
      platform: r.platform,
      description: r.description,
      scheduledAt: r.scheduledAt.toISOString(),
      price: Number(r.price),
      isPaid: r.isPaid,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return { orders, storageMode: "supabase" };
  }

  const orders = await readLocalOrders();
  return { orders, storageMode: "local" };
}

export async function saveOrderAction(input: SaveOrderInput): Promise<VideoOrderDTO> {
  const scheduledDate = new Date(`${input.scheduledAt}T12:00:00.000Z`);
  const cleanPrice = Number.isFinite(Number(input.price)) ? Math.max(0, Number(input.price)) : 0;

  if (isDatabaseConfigured && prisma) {
    if (input.id) {
      const updated = await prisma.videoOrder.update({
        where: { id: input.id },
        data: {
          title: input.title.trim(),
          clientName: input.clientName.trim(),
          platform: input.platform,
          description: input.description?.trim() || null,
          scheduledAt: scheduledDate,
          price: cleanPrice,
          isPaid: input.isPaid,
          status: input.status,
        },
      });
      revalidatePath("/");
      return {
        id: updated.id,
        title: updated.title,
        clientName: updated.clientName,
        platform: updated.platform,
        description: updated.description,
        scheduledAt: updated.scheduledAt.toISOString(),
        price: Number(updated.price),
        isPaid: updated.isPaid,
        status: updated.status,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } else {
      const created = await prisma.videoOrder.create({
        data: {
          title: input.title.trim(),
          clientName: input.clientName.trim(),
          platform: input.platform,
          description: input.description?.trim() || null,
          scheduledAt: scheduledDate,
          price: cleanPrice,
          isPaid: input.isPaid,
          status: input.status,
        },
      });
      revalidatePath("/");
      return {
        id: created.id,
        title: created.title,
        clientName: created.clientName,
        platform: created.platform,
        description: created.description,
        scheduledAt: created.scheduledAt.toISOString(),
        price: Number(created.price),
        isPaid: created.isPaid,
        status: created.status,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    }
  }

  const orders = await readLocalOrders();
  const now = new Date().toISOString();

  if (input.id) {
    const idx = orders.findIndex((o) => o.id === input.id);
    if (idx !== -1) {
      const updated: VideoOrderDTO = {
        ...orders[idx],
        title: input.title.trim(),
        clientName: input.clientName.trim(),
        platform: input.platform,
        description: input.description?.trim() || null,
        scheduledAt: scheduledDate.toISOString(),
        price: cleanPrice,
        isPaid: input.isPaid,
        status: input.status,
        updatedAt: now,
      };
      orders[idx] = updated;
      await writeLocalOrders(orders);
      revalidatePath("/");
      return updated;
    }
  }

  const created: VideoOrderDTO = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    clientName: input.clientName.trim(),
    platform: input.platform,
    description: input.description?.trim() || null,
    scheduledAt: scheduledDate.toISOString(),
    price: cleanPrice,
    isPaid: input.isPaid,
    status: input.status,
    createdAt: now,
    updatedAt: now,
  };

  orders.push(created);
  await writeLocalOrders(orders);
  revalidatePath("/");
  return created;
}

export async function toggleOrderPaidAction(
  id: string,
  isPaid: boolean
): Promise<VideoOrderDTO | null> {
  if (isDatabaseConfigured && prisma) {
    const updated = await prisma.videoOrder.update({
      where: { id },
      data: { isPaid },
    });
    revalidatePath("/");
    return {
      id: updated.id,
      title: updated.title,
      clientName: updated.clientName,
      platform: updated.platform,
      description: updated.description,
      scheduledAt: updated.scheduledAt.toISOString(),
      price: Number(updated.price),
      isPaid: updated.isPaid,
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  const orders = await readLocalOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;

  orders[idx] = {
    ...orders[idx],
    isPaid,
    updatedAt: new Date().toISOString(),
  };
  await writeLocalOrders(orders);
  revalidatePath("/");
  return orders[idx];
}

export async function deleteOrderAction(id: string): Promise<void> {
  if (isDatabaseConfigured && prisma) {
    await prisma.videoOrder.delete({ where: { id } });
    revalidatePath("/");
    return;
  }

  const orders = await readLocalOrders();
  const filtered = orders.filter((o) => o.id !== id);
  await writeLocalOrders(filtered);
  revalidatePath("/");
}
