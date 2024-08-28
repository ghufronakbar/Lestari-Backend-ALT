'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.webanimals = async (req, res) => {    
    try {
        let { page, search, date_start, date_end } = req.query
        if (search === undefined || search === '') { search = '' }
        page = parseInt(page)
        if (page === undefined || isNaN(page)) { page = 1 }

        const where = {
            OR: [
                { local_name: { contains: search, mode: 'insensitive' } },
                { latin_name: { contains: search, mode: 'insensitive' } }
            ]
        }
        if (date_start && date_end) {
            where.date = {
                gte: new Date(date_start),
                lte: new Date(date_end)
            };
        } else if (date_start) {
            where.date = {
                gte: new Date(date_start)
            };
        } else if (date_end) {
            where.date = {
                lte: new Date(date_end)
            };
        }
        const animals = await prisma.animals.findMany({
            skip: (page - 1) * 10,
            take: 10,
            include: {
                user: {
                    select: {
                        id_user: true,
                        name: true,
                        email: true,
                        picture: true,
                        phone: true
                    }
                }
            },
            orderBy: {
                id_animal: 'desc'
            },
            where
        });

        const results = animals.map(animal => ({
            id_animal: animal.id_animal,
            local_name: animal.local_name,
            latin_name: animal.latin_name,
            habitat: animal.habitat,
            description: animal.description,
            city: animal.city,
            longitude: animal.longitude,
            latitude: animal.latitude,
            url_google_map: `http://maps.google.com/maps/search/?api=1&query=${animal.latitude}%2C${animal.longitude}`,
            image: animal.image ,
            amount: animal.amount,
            id_user: animal.user.id_user,
            name: animal.user.name,
            email: animal.user.email,
            user_picture: animal.user.picture,
            phone: animal.user.phone,
            date: animal.date,
            updated_at: animal.updated_at
        }));

        const count = await prisma.animals.count({ where });

        const pagination = {
            page,
            total_page: Math.ceil(count / 10),
            total_data: count,
        }

        return res.status(200).json({ status: 200, pagination, values: results });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Terjadi kesalahan sistem' });
    }
};

exports.webanimalid = async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const animal = await prisma.animals.findUnique({
            where: {
                id_animal: id
            },
            include: {
                user: {
                    select: {
                        id_user: true,
                        name: true,
                        email: true,
                        picture: true,
                        phone: true
                    }
                }
            }
        });

        if (!animal) {
            return res.status(404).json({ status: 404, message: 'Animal not found' });
        }

        const result = {
            id_animal: animal.id_animal,
            local_name: animal.local_name,
            latin_name: animal.latin_name,
            habitat: animal.habitat,
            description: animal.description,
            city: animal.city,
            longitude: animal.longitude,
            latitude: animal.latitude,
            image: animal.image ,
            amount: animal.amount,
            id_user: animal.user.id_user,
            name: animal.user.name,
            email: animal.user.email,
            user_picture: animal.user.picture ,
            phone: animal.user.phone,
            date: animal.date,
            updated_at: animal.updated_at
        };

        return res.status(200).json({ status: 200, values: [result] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Terjadi kesalahan sistem' });
    }
};


exports.webanimaledit = async (req, res) => {
    const {
        local_name,
        latin_name,
        habitat,
        description,
        city,
        longitude,
        latitude,
        image,
        amount
    } = req.body;

    const id = parseInt(req.params.id);

    try {
        const updatedAnimal = await prisma.animals.update({
            where: { id_animal: id },
            data: {
                local_name,
                latin_name,
                habitat,
                description,
                city,
                longitude,
                latitude,
                image,
                amount,
                updated_at: new Date()
            }
        });

        return res.status(200).json({ status: 200, message: 'Data Satwa berhasil diupdate', animal: updatedAnimal });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Terjadi kesalahan sistem' });
    }
};

exports.webanimaldelete = async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        await prisma.animals.delete({
            where: { id_animal: id }
        });

        return res.status(200).json({ status: 200, message: 'Data Satwa berhasil dihapus' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Terjadi kesalahan sistem' });
    }
};