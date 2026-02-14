'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  
  return await prisma.user.findUnique({
    where: { email: session.user.email },
  });
}

export async function updateUserName(name: string) {
  const session = await auth();
  if (!session?.user?.email) return;
  
  await prisma.user.update({
    where: { email: session.user.email },
    data: { name },
  });
  
  revalidatePath('/profile');
}

export async function getUserAircraft() {
  const session = await auth();
  if (!session?.user?.email) return [];
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { aircraft: true },
  });
  
  return user?.aircraft.map(ac => ({
    id: ac.id,
    nNumber: ac.nNumber,
    nickname: ac.nickname,
  })) || [];
}

export async function addUserAircraft(nNumber: string, nickname: string | null) {
  const session = await auth();
  if (!session?.user?.email) return null;
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  
  if (!user) return null;
  
  // Check if already exists
  const existing = await prisma.userAircraft.findFirst({
    where: { userId: user.id, nNumber: nNumber.toUpperCase() },
  });
  
  if (existing) return null;
  
  const aircraft = await prisma.userAircraft.create({
    data: {
      userId: user.id,
      nNumber: nNumber.toUpperCase(),
      nickname,
    },
  });
  
  revalidatePath('/profile');
  return aircraft;
}

export async function removeUserAircraft(id: string) {
  const session = await auth();
  if (!session?.user?.email) return;
  
  await prisma.userAircraft.delete({
    where: { id },
  });
  
  revalidatePath('/profile');
}
