"use strict";

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.mobhistoryanimals = async (req, res) => {
  const { id_user } = req.decoded;

  const { hostname } = req;
  const port = req.port !== undefined ? `:${req.port}` : process.env.PORT !== undefined ? `:${process.env.PORT}` : '';
  const baseUrl = `http://${hostname}${port}`;

  try {
    const animals = await prisma.animals.findMany({
      where: { id_user },
      select: {
        id_animal: true,
        local_name: true,
        latin_name: true,
        image: true,
        city: true,
        longitude: true,
        latitude: true,
      },
      orderBy: {
        updated_at: 'desc',
      },
    });

    const results = animals.map(animal => ({
      id_animal: animal.id_animal,
      local_name: animal.local_name,
      latin_name: animal.latin_name,
      image: animal.image ? `${baseUrl}/v1/mob/image/animal/${animal.image}` : `${baseUrl}/v1/mob/image/animal/default.png`,
      city: animal.city,
      longitude: animal.longitude,
      latitude: animal.latitude,
    }));

    return res.status(200).json({ status: 200, values: results });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};

exports.mobhistoryanimalid = async (req, res) => {
  const { id_animal } = req.params;

  const { protocol, host } = req;
  const port = ":" + req.port || process.env.PORT || ""
  const baseUrl = `${protocol}://${host}${port}`

  try {
    const animal = await prisma.animals.findUnique({
      where: { id_animal: parseInt(id_animal) },
      select: {
        id_animal: true,
        local_name: true,
        latin_name: true,
        habitat: true,
        description: true,
        city: true,
        longitude: true,
        latitude: true,
        image: true,
        amount: true,
        id_user: true,
        date: true,
        updated_at: true,
      },
    });

    if (!animal) {
      return res.status(404).send('Animal not found');
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
      image: animal.image ? `${baseUrl}/v1/mob/image/animal/${animal.image}` : `${baseUrl}/v1/mob/image/animal/default.png`,
      amount: animal.amount,
      id_user: animal.id_user,
      date: animal.date,
      updated_at: animal.updated_at,
    };

    return res.status(200).json({ status: 200, values: [result] });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};


exports.mobanimalpost = async (req, res) => {
  const { local_name, latin_name, habitat, description, city, longitude, latitude, image, amount } = req.body;
  const { id_user } = req.decoded;
  const now = new Date();
  const date_now = `${now.getFullYear()}-${("0" + (now.getMonth() + 1)).slice(-2)}-${("0" + now.getDate()).slice(-2)} ${("0" + now.getHours()).slice(-2)}:${("0" + now.getMinutes()).slice(-2)}:${("0" + now.getSeconds()).slice(-2)}`;

  try {
    await prisma.animals.create({
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
        id_user,
        date: date_now,
        updated_at: date_now
      }
    });
    return res.status(200).json({ status: 200, message: "Success" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
};

exports.mobediteditableanimal = async (req, res) => {
  const { local_name, latin_name, habitat, description, city, longitude, latitude, amount } = req.body;
  const { id_user } = req.decoded;
  const { id_animal } = req.params;
  const now = new Date();
  const date_now = `${now.getFullYear()}-${("0" + (now.getMonth() + 1)).slice(-2)}-${("0" + now.getDate()).slice(-2)} ${("0" + now.getHours()).slice(-2)}:${("0" + now.getMinutes()).slice(-2)}:${("0" + now.getSeconds()).slice(-2)}`;

  try {
    await prisma.animals.updateMany({
      where: {
        id_animal: parseInt(id_animal),
        id_user
      },
      data: {
        local_name,
        latin_name,
        habitat,
        description,
        city,
        longitude,
        latitude,
        amount,
        updated_at: date_now
      }
    });
    return res.status(200).json({ status: 200, message: "Success" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
};

exports.mobediteditableanimalimage = async (req, res) => {
  const { image } = req.body;
  const { id_user } = req.decoded;
  const { id_animal } = req.params;
  const now = new Date();
  const date_now = `${now.getFullYear()}-${("0" + (now.getMonth() + 1)).slice(-2)}-${("0" + now.getDate()).slice(-2)} ${("0" + now.getHours()).slice(-2)}:${("0" + now.getMinutes()).slice(-2)}:${("0" + now.getSeconds()).slice(-2)}`;

  try {
    const result = await prisma.animals.updateMany({
      where: {
        id_animal: parseInt(id_animal),
        id_user
      },
      data: {
        image,
        updated_at: date_now
      }
    });

    if (result.count === 0) {
      return res.status(404).json({ status: 404, message: "Animal not found or user not authorized" });
    }

    return res.status(200).json({ status: 200, message: "Edited" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
};
