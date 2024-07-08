import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  console.log('🔍 Fetching published diagrams');
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');

  try {
    const filters: any = {
      isPublished: true,
    };

    if (category) {
      filters['content'] = {
        ...filters['content'],
        path: ['tags', 'general'],
        string_contains: category,
      };
    }

    if (subcategory) {
      filters['content'] = {
        ...filters['content'],
        path: ['tags', 'specific'],
        string_contains: subcategory,
      };
    }

    const publishedDiagrams = await prisma.diagram.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    console.log('✅ Published diagrams fetched successfully', publishedDiagrams);
    return NextResponse.json(publishedDiagrams, { status: 200 });
  } catch (error: any) {
    console.log('❌ Error fetching published diagrams:', error.message);
    return NextResponse.json({ message: 'An error occurred while fetching published diagrams', error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });

  if (!session) {
    console.log('❌ Unauthorized: No session found');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const diagramID = searchParams.get('diagramID');

  if (!diagramID) {
    return NextResponse.json({ message: '⚠️ Diagram ID is required' }, { status: 400 });
  }

  try {
    console.log('🛠 Updating diagram to publish:', diagramID);
    const updatedDiagram = await prisma.diagram.update({
      where: { id: diagramID },
      data: {
        isPublished: true,
      },
    });

    console.log('✅ Diagram published successfully:', updatedDiagram);
    return NextResponse.json(updatedDiagram, { status: 200 });
  } catch (error: any) {
    console.log('❌ Error publishing diagram:', error.message);
    return NextResponse.json({ message: 'An error occurred while publishing the diagram', error: error.message }, { status: 500 });
  }
}