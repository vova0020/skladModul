/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {

 // Создаем роли, если они еще не существуют
 const roles = ['Администратор', 'Кладовщик'];

 for (const roleName of roles) {
   const role = await prisma.role.findUnique({ where: { name: roleName } });
   if (!role) {
     await prisma.role.create({ data: { name: roleName } });
     console.log(`Роли созданы ${roleName}.`);
   } else {
     console.log(`Роли ${roleName} уже есть.`);
   }
 }


    const adminLogin = 'Admin';
    const existingAdmin = await prisma.user.findUnique({
        where: { login: adminLogin },
    });

    if (!existingAdmin) {
        const adminPassword = await bcrypt.hash('Admin654!', 10);

        await prisma.user.create({
            data: {
                login: adminLogin,
                firstName: 'Admin',
                password: adminPassword,
                roleId: 2,
       
            },
        });
        console.log('Администратор создан.');
    } else {
        console.log('Учетная запись администратора уже существует.');
    }


}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
    $2b$10$UBgFAhOflROymuYJ78e/ie2mpfh7OxdglG2o416OiWyiV5lo/Yh2W   // Новый пароль
    $2b$10$gl4Csg4YXUoWZOnrfz8t8.buxGO7vS7/7nQi4oesN46LAWezkUI4W   // старый пароль