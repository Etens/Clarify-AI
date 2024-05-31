// pages/api/diagrams/published.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  console.log('🔍 Fetching published diagrams');

  try {
    const publishedDiagrams = await prisma.diagram.findMany({
      where: { isPublished: true },
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

    const diagramsWithUser = publishedDiagrams.map(diagram => ({
      ...diagram,
      user: diagram.user,
    }));

    console.log('✅ Published diagrams fetched successfully', diagramsWithUser);
    return NextResponse.json(diagramsWithUser, { status: 200 });
  } catch (error: any) {
    console.log('❌ Error fetching published diagrams:', error.message);
    return NextResponse.json({ message: 'An error occurred while fetching published diagrams', error: error.message }, { status: 500 });
  }
}
