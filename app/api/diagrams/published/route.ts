import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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
