import {NextResponse} from 'next/server';
import bcrypt from 'bcryptjs';
import {prisma} from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { firstName, lastName, email, password } = await request.json();

        const existingUser = await prisma.users.findFirst({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.users.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
