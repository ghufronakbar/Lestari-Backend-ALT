const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const md5 = require('md5');

const seedsAdmin = async () => {
    try {
        const validateAdmin = await prisma.admins.findMany();
        if (validateAdmin.length === 0) {
            await prisma.admins.create({
                data: {
                    // email: process.env.EMAIL,
                    email: "lanstheprodigy@gmail.com",
                    password: md5('Admin#1234'),
                    super_admin: 1
                }
            });
        }
    } catch (error) {
        console.log(error);
    }
}

const seedGuest = async () => {
    try {
        const validateGuest = await prisma.users.findFirst({ where: { id_user: 0 } })
        if (!validateGuest) {
            await prisma.users.create({
                data: {
                    id_user: 0,
                    email: "guest@example.com",
                    name: "Guest",
                    password: md5('Guest#1234')
                }
            });
        }
    } catch (error) {
        console.log(error);
    }
}

const seeds = async () => {
    try {
        await seedsAdmin();
        await seedGuest();
    } catch (error) {
        console.log(error);
    }
}


seeds().then(() => {
    prisma.$disconnect();
}).catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
})