import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const diagramId = searchParams.get('id');

  if (!diagramId) {
    return NextResponse.json({ message: '⚠️ ID is required' }, { status: 400 });
  }

  try {
    console.log('🔍 Fetching comments for diagram with ID:', diagramId);
    const comments = await prisma.comment.findMany({
      where: { diagramId },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('✅ Comments fetched successfully');
    return NextResponse.json(comments, { status: 200 });
  } catch (error: any) {
    console.log('❌ Error fetching comments:', error.message);
    return NextResponse.json({ message: 'An error occurred while fetching comments', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const diagramId = searchParams.get('id');
  const session = await getServerSession({ req, ...authOptions });

  if (!diagramId) {
    return NextResponse.json({ message: '⚠️ Diagram ID is required' }, { status: 400 });
  }

  if (!session) {
    return NextResponse.json({ message: '⚠️ You must be signed in to comment on diagrams' }, { status: 401 });
  }

  try {
    const { content } = await req.json();
    const userId = session.user?.id;

    console.log('💬 Adding comment to diagram with ID:', diagramId);
    const newComment = await prisma.comment.create({
      data: {
        diagramId: diagramId,
        userId: userId!,
        content: content,
      },
    });

    console.log('✅ Comment added successfully');
    return NextResponse.json(newComment, { status: 201 });
  } catch (error: any) {
    console.log('❌ Error adding comment:', error.message);
    return NextResponse.json({ message: 'An error occurred while adding comment', error: error.message }, { status: 500 });
  }
}
