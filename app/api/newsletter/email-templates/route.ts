import {NextRequest, NextResponse} from 'next/server';
import {getServerSession} from 'next-auth';
import {prisma} from "@/lib/prisma";
import {authOptions} from "@/lib/auth";
import moment from "moment";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const newsletter = await prisma.newsletters.findFirst({
            where: { userId: session.user.id }
        });

        if (!newsletter) {
            return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
        }

        const templates = await prisma.emailTemplates.findMany({
            where: { newsletterId: newsletter.id }
        });

        // Get related groups for templates
        const allGroupIds = [...new Set(templates.flatMap(t => t.targetGroupIds))];
        const groups = await prisma.groups.findMany({
            where: { id: { in: allGroupIds } }
        });

        const formattedTemplates = templates.map(template => ({
            id: template.id,
            name: template.name,
            subject: template.subject,
            status: template.status,
            targetType: template.targetType,
            groups: template.targetGroupIds.map(gid =>
                groups.find(g => g.id === gid)?.name || 'Unknown group'
            ),
            openRate: template.openRate,
            clickRate: template.clickRate,
            createdAt: moment(template.createdAt).format('MM/DD/yyyy HH:mm'),
            lastSentAt: template.lastSentAt ? moment(template.lastSentAt).format('MM/DD/yyyy HH:mm') : 'Not sent'
        }));

        return NextResponse.json(formattedTemplates);

    } catch (error) {
        console.error('[TEMPLATES_GET]', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const newsletter = await prisma.newsletters.findFirst({
            where: { userId: session.user.id }
        });

        if (!newsletter) {
            return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
        }

        const body = await req.json();
        const { name, subject, jsonContent, targetType = 'ALL', targetGroupIds = [] } = body;

        if (!subject || !jsonContent) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const newTemplate = await prisma.emailTemplates.create({
            data: {
                name,
                subject,
                jsonContent,
                status: 'DRAFT',
                targetType,
                targetGroupIds: targetType === 'GROUP' ? targetGroupIds : [],
                newsletterId: newsletter.id,
                openRate: 0,
                clickRate: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        return NextResponse.json(newTemplate, { status: 201 });

    } catch (error) {
        console.error('[TEMPLATES_POST]', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
