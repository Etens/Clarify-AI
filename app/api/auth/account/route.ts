import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../[...nextauth]/route';

const prisma = new PrismaClient();

const checkHeaders = (req: NextRequest): NextResponse | null => {
  console.log('🔍 Checking headers size');
  if (Object.keys(req.headers).some(header => header.length > 8000)) {
    console.log('🚫 Header size too large');
    return NextResponse.json({ error: 'Header size too large' }, { status: 431 });
  }
  return null;
};

export async function POST(req: NextRequest) {
  const headerCheck = checkHeaders(req);
  if (headerCheck) return headerCheck;

  const session = await getServerSession({ req, ...authOptions });

  if (!session) {
    console.log('❌ Unauthorized: No session found');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { user } = session;

  if (!user?.email) {
    console.log('❌ Unauthorized: No email found in session');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { name, language, profileImage } = await req.json();

  try {
    console.log('🕵️‍♂️ Checking if user exists with email:', user.email);
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      console.log('❌ User not found with email:', user.email);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log('🕵️‍♂️ Updating user with email:', user.email);
    const updatedUser = await prisma.user.update({
      where: { email: user.email },
      data: { name, language, profileImage },
    });
    console.log('✅ User updated successfully:', updatedUser);
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    console.log('❌ Error updating user:', error.message);
    return NextResponse.json({ message: 'An error occurred while updating the account', error: error.message }, { status: 500 });
  }
}
