import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  console.log('🔍 Fetching diagrams');
  const session = await getServerSession({ req, ...authOptions });

  if (!session) {
    console.log('❌ Unauthorized: No session found');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const diagrams = await prisma.diagram.findMany({
      where: { userId: (session as { user?: { id?: string } }).user?.id ?? undefined },
      orderBy: { createdAt: 'desc' }
    });

    console.log('✅ Diagrams fetched successfully');
    return NextResponse.json(diagrams, { status: 200 });
  } catch (error: any) {
    console.log('❌ Error fetching diagrams:', error.message);
    return NextResponse.json({ message: 'An error occurred while fetching diagrams', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });

  if (!session) {
    console.log('❌ Unauthorized: No session found');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const content = searchParams.get('content');
  const isPublished = searchParams.get('isPublished') === 'true';

  if (!content) {
    return NextResponse.json({ message: '⚠️ Content is required' }, { status: 400 });
  }

  try {
    console.log('🛠 Creating new diagram for user:', (session as { user?: { id?: string; email?: string } }).user?.email);
    const newDiagram = await prisma.diagram.create({
      data: {
        userId: (session as { user?: { id?: string } }).user?.id ?? '',
        content: JSON.parse(content),
        isPublished: isPublished,
        likes: 0,
        views: 0,
      },
    });

    console.log('✅ Diagram created successfully:', newDiagram);
    return NextResponse.json(newDiagram, { status: 200 });
  } catch (error: any) {
    console.log('❌ Error creating diagram:', error.message);
    return NextResponse.json({ message: 'An error occurred while creating diagram', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });

  if (!session) {
    console.log('❌ Unauthorized: No session found');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      console.log('🛠 Deleting diagram with ID:', id);

      await prisma.comment.deleteMany({
        where: { diagramId: id },
      });

      await prisma.view.deleteMany({
        where: { diagramId: id },
      });

      await prisma.like.deleteMany({
        where: { diagramId: id },
      });

      await prisma.diagram.delete({
        where: { id },
      });

      console.log('✅ Diagram and associated comments deleted successfully');
      return NextResponse.json({ message: 'Diagram and associated comments deleted successfully' }, { status: 200 });
    } else {
      console.log('🛠 Deleting all diagrams');

      await prisma.comment.deleteMany({
        where: { diagram: { userId: (session as { user?: { id?: string } }).user?.id ?? undefined } },
      });

      await prisma.view.deleteMany({
        where: { diagram: { userId: (session as { user?: { id?: string } }).user?.id ?? undefined } },
      });

      await prisma.like.deleteMany({
        where: { userId: (session as { user?: { id?: string } }).user?.id ?? undefined },
      });

      await prisma.diagram.deleteMany({
        where: { userId: (session as { user?: { id?: string } }).user?.id ?? undefined },
      });

      console.log('✅ All diagrams and associated comments deleted successfully');
      return NextResponse.json({ message: 'All diagrams and associated comments deleted successfully' }, { status: 200 });
    }
  } catch (error: any) {
    console.log('❌ Error deleting diagram:', error.message);
    return NextResponse.json({ message: 'An error occurred while deleting diagram(s)', error: error.message }, { status: 500 });
  }
}


export async function PATCH(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });

  if (!session) {
    console.log('❌ Unauthorized: No session found');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, title, elements } = await req.json();

    if (!id) {
      return NextResponse.json({ message: '⚠️ ID is required' }, { status: 400 });
    }

    console.log('🔄 Updating diagram with ID:', id);
    const updatedDiagram = await prisma.diagram.update({
      where: { id },
      data: {
        content: {
          title,
          elements
        }
      },
    });

    console.log('✅ Diagram updated successfully:', updatedDiagram);
    return NextResponse.json(updatedDiagram, { status: 200 });
  } catch (error: any) {
    console.log('❌ Error updating diagram:', error.message);
    return NextResponse.json({ message: 'An error occurred while updating diagram', error: error.message }, { status: 500 });
  }
}