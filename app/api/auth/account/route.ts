import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { name, language, profileImage } = await req.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { email: session.user?.email ?? undefined },
      data: { name, language, profileImage },
    });
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'An error occurred while updating the account', error: error.message }, { status: 500 });
  }
}