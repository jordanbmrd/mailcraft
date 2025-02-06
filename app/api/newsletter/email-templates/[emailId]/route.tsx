import {prisma} from "@/lib/prisma";
import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import moment from "moment";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ emailId: string }> }
) {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // D'abord récupérer le template
        const template = await prisma.emailTemplates.findFirst({
            where: {
                id: resolvedParams.emailId
            }
        });

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        // Ensuite vérifier si le newsletter associé appartient à l'utilisateur
        const newsletter = await prisma.newsletters.findFirst({
            where: {
                id: template.newsletterId,
                userId: session.user.id
            }
        });

        if (!newsletter) {
            return NextResponse.json({ error: 'Unauthorized access to this template' }, { status: 403 });
        }

        // Le reste du code reste identique
        const groups = template.targetGroupIds.length > 0
            ? await prisma.groups.findMany({
                where: { id: { in: template.targetGroupIds } }
            })
            : [];

        const formattedTemplate = {
            id: template.id,
            name: template.name,
            subject: template.subject,
            jsonContent: template.jsonContent,
            status: template.status,
            targetType: template.targetType,
            groups: template.targetGroupIds.map(gid =>
                groups.find(g => g.id === gid)?.name || 'Unknown group'
            ),
            targetGroupIds: template.targetGroupIds,
            openRate: template.openRate,
            clickRate: template.clickRate,
            createdAt: moment(template.createdAt).format('MM/DD/yyyy HH:mm'),
            lastSentAt: template.lastSentAt
                ? moment(template.lastSentAt).format('MM/DD/yyyy HH:mm')
                : 'Not sent'
        };

        return NextResponse.json(formattedTemplate);

    } catch (error) {
        console.error('[TEMPLATE_GET]', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ emailId: string }> }
) {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, subject, jsonContent, targetType, targetGroupIds } = body;

        // Vérifier d'abord si le template existe
        const existingTemplate = await prisma.emailTemplates.findFirst({
            where: {
                id: resolvedParams.emailId
            }
        });

        if (!existingTemplate) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        // Vérifier si l'utilisateur a le droit de modifier ce template
        const newsletter = await prisma.newsletters.findFirst({
            where: {
                id: existingTemplate.newsletterId,
                userId: session.user.id
            }
        });

        if (!newsletter) {
            return NextResponse.json({ error: 'Unauthorized access to this template' }, { status: 403 });
        }

        // Mettre à jour le template
        const updatedTemplate = await prisma.emailTemplates.update({
            where: {
                id: resolvedParams.emailId
            },
            data: {
                name,
                subject,
                jsonContent,
                targetType,
                targetGroupIds,
                updatedAt: new Date()
            }
        });

        // Récupérer les groupes associés pour la réponse
        const groups = targetGroupIds?.length > 0
            ? await prisma.groups.findMany({
                where: { id: { in: targetGroupIds } }
            })
            : [];

        // Formater la réponse
        const formattedTemplate = {
            id: updatedTemplate.id,
            name: updatedTemplate.name,
            subject: updatedTemplate.subject,
            jsonContent: updatedTemplate.jsonContent,
            status: updatedTemplate.status,
            targetType: updatedTemplate.targetType,
            groups: updatedTemplate.targetGroupIds.map(gid =>
                groups.find(g => g.id === gid)?.name || 'Unknown group'
            ),
            targetGroupIds: updatedTemplate.targetGroupIds,
            openRate: updatedTemplate.openRate,
            clickRate: updatedTemplate.clickRate,
            createdAt: moment(updatedTemplate.createdAt).format('MM/DD/yyyy HH:mm'),
            lastSentAt: updatedTemplate.lastSentAt
                ? moment(updatedTemplate.lastSentAt).format('MM/DD/yyyy HH:mm')
                : 'Not sent'
        };

        return NextResponse.json(formattedTemplate);

    } catch (error) {
        console.error('[TEMPLATE_UPDATE]', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
