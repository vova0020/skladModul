import { NextRequest, NextResponse } from "next/server";
import prismaInteraction from '@/api/prisma';

const prisma = new prismaInteraction();
export const dynamic = 'force-dynamic'; // показывает что фаил должен динамический быть

export async function PUT(req: NextRequest) {
    try {
        const data = await req.json();
        // console.log(name);
        // console.log(formData);
        
        // Обновляем запись в базе данных с помощью Prisma
        const updatedSectors = await prisma.PutInventoryAudit(data);

        return NextResponse.json(updatedSectors, { status: 200 });
    } catch (error) {
        console.error('Ошибка при обновлении записей:', error);
        return NextResponse.json({ message: 'Ошибка при обновлении записей' }, { status: 500 });
    }
}