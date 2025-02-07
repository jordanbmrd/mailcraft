import {NextResponse} from 'next/server';
import bcrypt from 'bcryptjs';
import {prisma} from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { username, email, password } = await request.json();
        
        // Transform username to lowercase
        const lowercaseUsername = username.toLowerCase();

        // Check if email or username already exists
        const existingUser = await prisma.users.findFirst({
            where: {
                OR: [
                    { email },
                    { username: lowercaseUsername }
                ]
            }
        });

        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            return NextResponse.json({ 
                error: `This ${field} is already taken` 
            }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.users.create({
            data: {
                username: lowercaseUsername,
                email,
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });

        // Create a newsletter for the new user
        await prisma.newsletters.create({
            data: {
                userId: user.id,
                name: `${lowercaseUsername}'s Newsletter`,
                description: `Newsletter by ${lowercaseUsername}`,
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
