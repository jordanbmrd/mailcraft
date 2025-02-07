import {prisma} from "@/lib/prisma";
import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import moment from "moment";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ emailId: string }> }
) {
    try {
        const resolvedParams = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get user's newsletter
        const newsletter = await prisma.newsletters.findFirst({
            where: { userId: session.user.id }
        });

        if (!newsletter) {
            return NextResponse.json(
                { error: "Newsletter not found" },
                { status: 404 }
            );
        }

        // Get template
        const template = await prisma.emailTemplates.findFirst({
            where: { id: resolvedParams.emailId }
        });

        if (!template) {
            return NextResponse.json(
                { error: "Email template not found" },
                { status: 404 }
            );
        }

        // Verify template belongs to user's newsletter
        if (template.newsletterId !== newsletter.id) {
            return NextResponse.json(
                { error: "Unauthorized access to this template" },
                { status: 403 }
            );
        }

        // Get all groups
        const groups = await prisma.groups.findMany({
            where: { newsletterId: newsletter.id }
        });

        // Format template data
        const formattedTemplate = {
            id: template.id,
            name: template.name,
            subject: template.subject,
            status: template.status,
            jsonContent: template.jsonContent,
            htmlContent: template.htmlContent,
            targetType: template.targetType,
            groups: groups.map(g => g.name),
            createdAt: moment(template.createdAt).format('MM/DD/yyyy HH:mm'),
            lastSentAt: template.lastSentAt ? moment(template.lastSentAt).format('MM/DD/yyyy HH:mm') : null,
            openCount: template.openCount,
            clickCount: template.clickCount
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
        const { name, subject, jsonContent, htmlContent, targetType } = body;

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
                htmlContent,
                targetType,
                updatedAt: new Date()
            }
        });

        // Get all groups
        const groups = await prisma.groups.findMany({
            where: { newsletterId: newsletter.id }
        });

        // Format updated template data
        const formattedTemplate = {
            id: updatedTemplate.id,
            name: updatedTemplate.name,
            subject: updatedTemplate.subject,
            status: updatedTemplate.status,
            jsonContent: updatedTemplate.jsonContent,
            htmlContent: updatedTemplate.htmlContent,
            targetType: updatedTemplate.targetType,
            groups: groups.map(g => g.name),
            createdAt: moment(updatedTemplate.createdAt).format('MM/DD/yyyy HH:mm'),
            lastSentAt: updatedTemplate.lastSentAt ? moment(updatedTemplate.lastSentAt).format('MM/DD/yyyy HH:mm') : null,
            openCount: updatedTemplate.openCount,
            clickCount: updatedTemplate.clickCount
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

export async function PATCH(
    req: NextRequest,
    { params }: { params: { emailId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get user's newsletter
        const newsletter = await prisma.newsletters.findFirst({
            where: { userId: session.user.id }
        });

        if (!newsletter) {
            return NextResponse.json(
                { error: "Newsletter not found" },
                { status: 404 }
            );
        }

        const body = await req.json();
        const { name, subject, jsonContent, targetType } = body;

        const updatedTemplate = await prisma.emailTemplates.update({
            where: { id: params.emailId },
            data: {
                name,
                subject,
                jsonContent,
                targetType,
                updatedAt: new Date()
            }
        });

        // Get all groups
        const groups = await prisma.groups.findMany({
            where: { newsletterId: newsletter.id }
        });

        // Format updated template data
        const formattedTemplate = {
            id: updatedTemplate.id,
            name: updatedTemplate.name,
            subject: updatedTemplate.subject,
            status: updatedTemplate.status,
            jsonContent: updatedTemplate.jsonContent,
            htmlContent: updatedTemplate.htmlContent,
            targetType: updatedTemplate.targetType,
            groups: groups.map(g => g.name),
            createdAt: moment(updatedTemplate.createdAt).format('MM/DD/yyyy HH:mm'),
            lastSentAt: updatedTemplate.lastSentAt ? moment(updatedTemplate.lastSentAt).format('MM/DD/yyyy HH:mm') : null,
            openCount: updatedTemplate.openCount,
            clickCount: updatedTemplate.clickCount
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

export async function DELETE(
    req: NextRequest,
    { params }: { params: { emailId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get user's newsletter
        const newsletter = await prisma.newsletters.findFirst({
            where: { userId: session.user.id }
        });

        if (!newsletter) {
            return NextResponse.json(
                { error: "Newsletter not found" },
                { status: 404 }
            );
        }

        // Get template
        const template = await prisma.emailTemplates.findFirst({
            where: { id: params.emailId }
        });

        if (!template) {
            return NextResponse.json(
                { error: "Email template not found" },
                { status: 404 }
            );
        }

        // Verify template belongs to user's newsletter
        if (template.newsletterId !== newsletter.id) {
            return NextResponse.json(
                { error: "Unauthorized access to this template" },
                { status: 403 }
            );
        }

        // Delete all associated email events first
        await prisma.emailEvents.deleteMany({
            where: { emailTemplateId: params.emailId }
        });

        // Delete the template
        await prisma.emailTemplates.delete({
            where: { id: params.emailId }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[TEMPLATE_DELETE]', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
