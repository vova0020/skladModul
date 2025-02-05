import {  NextResponse } from "next/server";
import prismaInteraction from '@/api/prisma';

const prisma = new prismaInteraction();
export const dynamic = 'force-dynamic'; // показывает что фаил должен динамический быть

// GET-запрос для получения данных
export async function GET() {
    try {
        const newOrder = await prisma.getDashboardInstrument();

        // console.log(newOrder);
        

        return NextResponse.json(newOrder, { status: 200 });
    } catch (error) {
        console.error('Ошибка при создании Заявки:', error);
        return NextResponse.json({ message: 'Ошибка при создании Заявки' }, { status: 500 });
    }
}
