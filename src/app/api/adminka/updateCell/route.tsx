import { NextRequest, NextResponse } from "next/server";
import prismaInteraction from '@/api/prisma';

const prisma = new prismaInteraction();
export const dynamic = 'force-dynamic'; // показывает что фаил должен динамический быть

// GET-запрос для получения данных
export async function GET() {
    try {
        const newOrder = await prisma.getAdminCell();

        // console.log(newOrder);
        

        return NextResponse.json(newOrder, { status: 200 });
    } catch (error) {
        console.error('Ошибка при создании Заявки:', error);
        return NextResponse.json({ message: 'Ошибка при создании Заявки' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const {sectorId, name} = await req.json();
        console.log(name);
        // console.log(formData);
        
        // Обновляем запись в базе данных с помощью Prisma
        const updatedSectors = await prisma.putAdminCell(sectorId, name);

        return NextResponse.json(updatedSectors, { status: 200 });
    } catch (error) {
        console.error('Ошибка при обновлении Участка:', error);
        return NextResponse.json({ message: 'Ошибка при обновлении Участка' }, { status: 500 });
    }
}
export async function DELETE(req: NextRequest) {
    try {
        const {sectorId} = await req.json();
        console.log(sectorId);
        // console.log(formData);
        
        // Обновляем запись в базе данных с помощью Prisma
        const updatedSectors = await prisma.delAdminCell(sectorId);

        return NextResponse.json(updatedSectors, { status: 200 });
    } catch (error) {
        console.error('Ошибка при обновлении Участка:', error);
        return NextResponse.json({ message: 'Ошибка при обновлении Участка' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
 
    try {
        const data = await req.json(); // Парсинг тела запроса
        console.log(data);
        
        const newOrder = await prisma.createAdminCell(data);
        // console.log(data);
        
        return NextResponse.json(newOrder, { status: 201 });
    } catch (error) {
        console.error('Ошибка при создании Участка:', error);
        return NextResponse.json({ message: 'Ошибка при создании Участка' }, { status: 500 });
    }
}