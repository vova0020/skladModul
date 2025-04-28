import { NextRequest, NextResponse } from "next/server";
import prismaInteraction from '@/api/prisma';
    // @ts-ignore
import bcrypt from "bcrypt";
import { PrismaClient } from '@prisma/client';
const Prisma = new PrismaClient();


const prisma = new prismaInteraction();
export const dynamic = 'force-dynamic'; // показывает что фаил должен динамический быть

// GET-запрос для получения данных
export async function GET() {
    try {
        const newOrder = await prisma.getAdminUsers();

        // console.log(newOrder);
        

        return NextResponse.json(newOrder, { status: 200 });
    } catch (error) {
        console.error('Ошибка при создании Заявки:', error);
        return NextResponse.json({ message: 'Ошибка при создании Заявки' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const data = await req.json();
        const { userId, newPassword } = data;
        
        if (!userId || !newPassword) {
            return NextResponse.json({ error: 'Отсутствуют необходимые данные' }, { status: 400 });
        }

        // Хэширование нового пароля
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Используем PrismaClient напрямую для этой операции
        const updatedUser = await Prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        if (!updatedUser) {
            return NextResponse.json({ error: 'Ошибка изменения пароля' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Пароль успешно изменен' }, { status: 200 });
    } catch (error) {
        console.error('Ошибка при изменении пароля:', error);
        return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
    }
}
export async function DELETE(req: NextRequest) {
    try {
        const {sectorId} = await req.json();
        console.log(sectorId);
        // console.log(formData);
        
        // Обновляем запись в базе данных с помощью Prisma
        const updatedSectors = await prisma.delAdminUsers(sectorId);

        return NextResponse.json(updatedSectors, { status: 200 });
    } catch (error) {
        console.error('Ошибка при обновлении Участка:', error);
        return NextResponse.json({ message: 'Ошибка при обновлении Участка' }, { status: 500 });
    }
}

// export async function POST(req: NextRequest) {
 
//     try {
//         const data = await req.json(); // Парсинг тела запроса
//         console.log(data);
        
//         const newOrder = await prisma.createAdminUsers(data);
//         // console.log(data);
        
//         return NextResponse.json(newOrder, { status: 201 });
//     } catch (error) {
//         console.error('Ошибка при создании Участка:', error);
//         return NextResponse.json({ message: 'Ошибка при создании Участка' }, { status: 500 });
//     }
// }