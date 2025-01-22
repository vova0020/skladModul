/* eslint-disable */
// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prismaInteraction from '@/api/prisma';

const prisma = new prismaInteraction();

export async function POST(req: NextRequest) {
    try {
        const { firstName, lastName, login, password, role} = await req.json(); // Парсинг тела запроса

        // Хэшируем пароль перед сохранением
        const hashedPassword = await bcrypt.hash(password, 10);

        const data = {
            firstName,
            lastName,
            login,
            password: hashedPassword,  // Сохраняем хэшированный пароль
            role,
  
            // Если сектор не передан, сохраняем null
        };

        // Создаем нового пользователя в базе данных
        const newUser = await prisma.createUser(data);

        return NextResponse.json({ message: "Пользователь успешно зарегистрирован", newUser }, { status: 201 });
    } catch (error) {
        console.error("Ошибка при регистрации пользователя:", error);

        if (error.message === 'USER_EXISTS') {
            return NextResponse.json({ message: "Пользователь с таким логином уже существует" }, { status: 409 });
        }

        return NextResponse.json({ message: "Ошибка при регистрации пользователя" }, { status: 500 });
    }
}


