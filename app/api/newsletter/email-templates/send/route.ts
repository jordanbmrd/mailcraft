import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import nodemailer from "nodemailer";
import { JSDOM } from "jsdom";

// Fonction pour ajouter le pixel de suivi et transformer les liens
function addTracking(html: string, emailId: string, subscriberId: string) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Ajouter le pixel de suivi
    const trackingPixel = document.createElement("img");
    trackingPixel.src = `${baseUrl}/api/newsletter/email-templates/${emailId}/track?subscriberId=${subscriberId}&eventType=open`;
    trackingPixel.style.display = "none";
    document.body.appendChild(trackingPixel);

    // Transformer tous les liens
    const links = document.getElementsByTagName("a");
    for (const link of links) {
        console.log("LINK :::", link);
        const originalUrl = link.getAttribute("href");
        console.log("ORIGINAL URL :::", originalUrl);
        if (originalUrl) {
            const trackingUrl = `${baseUrl}/api/newsletter/email-templates/${emailId}/track?subscriberId=${subscriberId}&eventType=click&url=${encodeURIComponent(originalUrl)}`;
            link.setAttribute("href", trackingUrl);
        }
    }

    return dom.serialize();
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

export async function POST(req: NextRequest) {
    try {
        // Vérifier l'authentification
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                {error: "Unauthorized"},
                {status: 401}
            );
        }

        const body = await req.json();
        const {emailId, subscriberIds} = body;

        // Récupérer le template de l'email
        const emailTemplate = await prisma.emailTemplates.findUnique({
            where: {
                id: emailId
            }
        });

        if (!emailTemplate) {
            return NextResponse.json(
                {error: "Email template not found"},
                {status: 404}
            );
        }

        // Récupérer les abonnés
        const subscribers = await prisma.subscribers.findMany({
            where: {
                id: {
                    in: subscriberIds
                }
            }
        });

        // Créer un historique d'envoi
        const sendingHistory = await prisma.emailSendingHistory.create({
            data: {
                emailTemplateId: emailId,
                newsletterId: emailTemplate.newsletterId,
                sentAt: new Date(),
                subscribers: subscribers.map(subscriber => ({
                    email: subscriber.email,
                    status: 'pending',
                    subscriberId: subscriber.id
                }))
            }
        });

        // Envoyer les emails
        const emailPromises = subscribers.map(async (subscriber) => {
            try {
                // Ajouter le tracking à l'email
                const trackedHtml = addTracking(
                    emailTemplate.htmlContent,
                    emailId,
                    subscriber.id
                );

                await transporter.sendMail({
                    from: process.env.GMAIL_USER,
                    to: subscriber.email,
                    subject: emailTemplate.subject,
                    html: trackedHtml
                });

                // Mettre à jour le statut dans l'historique
                await prisma.emailSendingHistory.update({
                    where: {
                        id: sendingHistory.id
                    },
                    data: {
                        subscribers: {
                            updateMany: {
                                where: {
                                    subscriberId: subscriber.id
                                },
                                data: {
                                    status: 'sent'
                                }
                            }
                        }
                    }
                });

                return {
                    email: subscriber.email,
                    status: 'sent'
                };
            } catch (error) {
                console.error(`Failed to send email to ${subscriber.email}:`, error);

                // Mettre à jour le statut dans l'historique
                await prisma.emailSendingHistory.update({
                    where: {
                        id: sendingHistory.id
                    },
                    data: {
                        subscribers: {
                            updateMany: {
                                where: {
                                    subscriberId: subscriber.id
                                },
                                data: {
                                    status: 'failed'
                                }
                            }
                        }
                    }
                });

                return {
                    email: subscriber.email,
                    status: 'failed',
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        });

        const results = await Promise.all(emailPromises);

        // Mettre à jour lastSentAt du template
        await prisma.emailTemplates.update({
            where: {
                id: emailId
            },
            data: {
                lastSentAt: new Date(),
                status: 'sent'
            }
        });

        return NextResponse.json({
            success: true,
            results
        });
    } catch (error) {
        console.error("Error sending emails:", error);
        return NextResponse.json(
            {error: "Internal server error"},
            {status: 500}
        );
    }
} 