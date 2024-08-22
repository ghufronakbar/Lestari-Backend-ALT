"use strict"

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.showSuggestion = async (req, res) => {
    const q = req.query.q || ''    
    try {
        const getSuggestion = await prisma.suggestion.findMany({
            orderBy: {
                id_suggestion: 'desc'
            },
            where: {
                OR: [
                    { local_name: { contains: q, mode: 'insensitive' } },
                    { latin_name: { contains: q, mode: 'insensitive' } }
                ]
            }
        })

        return res.status(200).json({ status: 200, data: getSuggestion })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Terjadi kesalahan sistem' });
    }
}