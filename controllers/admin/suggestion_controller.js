'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllSugestions = async (req, res) => {
    const page = req.query.page || 1
    const search = req.query.search || ''
    try {
        const where = {
            OR: [
                { local_name: { contains: search, mode: 'insensitive' } },
                { latin_name: { contains: search, mode: 'insensitive' } },
            ]
        }
        const getSuggestion = await prisma.suggestion.findMany({
            orderBy: {
                id_suggestion: 'desc'
            },
            skip: (page - 1) * 10,
            take: 10,
            where           
        })
        const pagination = {
            page,
            total_page: Math.ceil((await prisma.suggestion.count({ where: where})) / 10),
            total_data: await prisma.suggestion.count({ where: where})
        }
        return res.status(200).json({ status: 200,pagination, values: getSuggestion })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Internal Server Error' })
    }
}

exports.createSuggestion = async (req, res) => {
    const { local_name, latin_name } = req.body
    try {
        if (!local_name || !latin_name) {
            return res.status(400).json({ status: 400, message: 'Field cannot be empty' })
        }

        const checkSuggestion = await prisma.suggestion.findFirst({
            where: {
                OR: [
                    { local_name: { equals: local_name, mode: 'insensitive' } },
                    { latin_name: { equals: latin_name, mode: 'insensitive' } }
                ]
            }
        })
        if (checkSuggestion) {
            return res.status(400).json({ status: 400, message: 'Suggestion already exists' })
        }

        const createSuggestion = await prisma.suggestion.create({
            data: {
                local_name,
                latin_name
            }
        })
        return res.status(200).json({ status: 200, message: 'Suggestion created successfully', values: createSuggestion })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Internal Server Error' })
    }
}

exports.deleteSuggestion = async (req, res) => {
    const id_suggestion = parseInt(req.params.id)
    try {
        const deleteSuggestion = await prisma.suggestion.delete({
            where: {
                id_suggestion
            }
        })
        return res.status(200).json({ status: 200, message: 'Suggestion deleted successfully', values: deleteSuggestion })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Internal Server Error' })
    }
}

exports.editSuggestion = async (req, res) => {
    const id_suggestion = parseInt(req.params.id)
    const { local_name, latin_name } = req.body
    try {
        if (!local_name || !latin_name) {
            return res.status(400).json({ status: 400, message: 'Field cannot be empty' })
        }
        const editSuggestion = await prisma.suggestion.update({
            where: {
                id_suggestion
            },
            data: {
                local_name,
                latin_name
            }
        })
        return res.status(200).json({ status: 200, message: 'Suggestion updated successfully', values: editSuggestion })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Internal Server Error' })
    }
}
