import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: '⚠️ ID is required' }, { status: 400 });
  }

  const check = searchParams.get('check');

  if (check) {
    return checkIfLiked(req);
  }

  try {
    console.log('🔍 Fetching likes for diagram with ID:', id);
    const diagram = await prisma.diagram.findUnique({
      where: { id },
      select: { likes: true },
    });

    console.log('✅ Likes fetched successfully');
    return NextResponse.json({ likes: diagram?.likes ?? 0 }, { status: 200 });
  } catch (error: any) {
    console.log('❌ Error fetching likes:', error.message);
    return NextResponse.json({ message: 'An error occurred while fetching likes', error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const action = searchParams.get('action');
  const session = await getServerSession({ req, ...authOptions });

  if (!id || !action) {
    return NextResponse.json({ message: '⚠️ ID and action are required' }, { status: 400 });
  }

  if (!session) {
    return NextResponse.json({ message: '⚠️ You must be signed in to like diagrams' }, { status: 401 });
  }

  try {
    const userId = session.user?.id;

    if (action === 'like') {
      console.log('👍 Liking diagram with ID:', id);
      await prisma.diagram.update({
        where: { id },
        data: { likes: { increment: 1 } },
      });
      await prisma.like.create({
        data: { diagramId: id, userId: userId! },
      });
      console.log('✅ Diagram liked successfully');
    } else if (action === 'unlike') {
      console.log('👎 Unliking diagram with ID:', id);
      await prisma.diagram.update({
        where: { id },
        data: { likes: { decrement: 1 } },
      });
      await prisma.like.deleteMany({
        where: { diagramId: id, userId: userId },
      });
      console.log('✅ Diagram unliked successfully');
    }

    return NextResponse.json({ message: `Diagram ${action}d successfully` }, { status: 200 });
  } catch (error: any) {
    console.log(`❌ Error ${action}ing diagram:`, error.message);
    return NextResponse.json({ message: `An error occurred while ${action}ing diagram`, error: error.message }, { status: 500 });
  }
}

export async function checkIfLiked(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const session = await getServerSession({ req, ...authOptions });

  if (!id) {
    return NextResponse.json({ message: '⚠️ ID is required' }, { status: 400 });
  }

  if (!session) {
    return NextResponse.json({ message: '⚠️ You must be signed in to check likes' }, { status: 401 });
  }

  try {
    const userId = session.user?.id; 
    const like = await prisma.like.findUnique({
      where: { id: id, diagramId: id, userId: userId }, 
    });

    return NextResponse.json({ liked: !!like }, { status: 200 });
  } catch (error: any) {
    console.log('❌ Error checking like status:', error.message);
    return NextResponse.json({ message: 'An error occurred while checking like status', error: error.message }, { status: 500 });
  }
}
