import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../[...nextauth]/route';

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

    console.log('🔐 Getting server session');
    const session = await getServerSession({ req, ...authOptions });

    if (!session) {
        console.log('❌ Unauthorized: No session found');
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { diagramsPublished } = await req.json();

    try {
        console.log('🔍 Diagrams published:', diagramsPublished);
        console.log('🛠 Publish user diagrams for email:', session.user?.email);
        const updatedUser = await prisma.user.update({
            where: { email: session.user?.email ?? undefined },
            data: { diagramsPublished },
        });
        console.log('✅ User diagrams Published successfully:', updatedUser);
        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error: any) {
        console.log('❌ Error updating user diagrams:', error.message);
        return NextResponse.json({ message: 'An error occurred while updating diagramsPublished', error: error.message }, { status: 500 });
    }
}
