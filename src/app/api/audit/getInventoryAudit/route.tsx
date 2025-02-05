import { NextRequest, NextResponse } from "next/server";
import prismaInteraction from '@/api/prisma';

const prisma = new prismaInteraction();
export const dynamic = 'force-dynamic'; // показывает что фаил должен динамический быть

// GET-запрос для получения данных
export async function GET() {
    try {
        const newOrder = await prisma.getInventoryAudit();

        // console.log(newOrder);
        

        return NextResponse.json(newOrder, { status: 200 });
    } catch (error) {
        console.error('Ошибка при получении записи сверки:', error);
        return NextResponse.json({ message: 'Ошибка при получении записи сверки' }, { status: 500 });
    }
}
export async function POST(req: NextRequest) {
 
    try {
        const {userId} = await req.json(); // Парсинг тела запроса
        console.log(userId);
        
        const newOrder = await prisma.CreateInventoryAudit(userId);
        // console.log(data);
        
        return NextResponse.json(newOrder, { status: 201 });
    } catch (error) {
        console.error('Ошибка при создании записи сверки:', error);
        return NextResponse.json({ message: 'Ошибка при создании записи сверки' }, { status: 500 });
    }
}