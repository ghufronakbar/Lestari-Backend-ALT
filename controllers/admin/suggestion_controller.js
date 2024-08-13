'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllSugestions = async (req, res) => {
    const page = req.query.page || 1
    try {
        const getSuggestion = await prisma.suggestion.findMany({
            orderBy: {
                id_suggestion: 'desc'
            },
            skip: (page - 1) * 10,
            take: 10
        })
        return res.status(200).json({ status: 200, data: getSuggestion })
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
        const createSuggestion = await prisma.suggestion.create({
            data: {
                local_name,
                latin_name
            }
        })
        return res.status(200).json({ status: 200, message: 'Suggestion created successfully', data: createSuggestion })
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
        return res.status(200).json({ status: 200, message: 'Suggestion deleted successfully', data: deleteSuggestion })
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
        return res.status(200).json({ status: 200, message: 'Suggestion updated successfully', data: editSuggestion })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: 'Internal Server Error' })
    }
}
