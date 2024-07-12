const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const md5 = require('md5');

const createSuperAdminFirst = async () => {
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

createSuperAdminFirst().then(() => {
    prisma.$disconnect();
}).catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
})