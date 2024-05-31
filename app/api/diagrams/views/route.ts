// pages/api/diagrams/views.ts

import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const session = await getServerSession({ req, ...authOptions });

  if (!id) {
    return NextResponse.json({ message: '⚠️ ID is required' }, { status: 400 });
  }

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    console.log('👀 Checking views for diagram with ID:', id);
    const existingView = await prisma.view.findUnique({
      where: {
        user_diagram_unique: {
          userId: userId!,
          diagramId: id,
        },
      },
    });

    if (existingView) {
      console.log('🔄 View already exists for this user and diagram.');
      return NextResponse.json({ message: 'View already counted' }, { status: 200 });
    }

    console.log('👀 Incrementing views for diagram with ID:', id);
    await prisma.view.create({
      data: {
        userId: userId!, // Assert that userId is not undefined
        diagramId: id,
      },
    });

    const updatedDiagram = await prisma.diagram.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    console.log('✅ Views incremented successfully');
    return NextResponse.json({ views: updatedDiagram.views }, { status: 200 });
  } catch (error: any) {
    console.log('❌ Error incrementing views:', error.message);
    return NextResponse.json({ message: 'An error occurred while incrementing views', error: error.message }, { status: 500 });
  }
}
