"use strict";

const multer = require("multer");
const path = require("path");

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { authorize } = require('../../lib/authorize');
const { uploadFileToDrive } = require('../../lib/uploadFileToDrive')
const { deleteFileFromDrive } = require('../../lib/deleteFromDrive');
const { extractFileIdFromUrl } = require('../../lib/extractFileIdFromUrl')


exports.mobeditableanimals = async (req, res) => {
  const { id_user } = req.decoded;
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const formattedDate = sevenDaysAgo.toISOString().slice(0, 10);

  try {
    const animals = await prisma.animals.findMany({
      where: {
        id_user: id_user,
        date: {
          gte: new Date(formattedDate)
        }
      },
      select: {
        id_animal: true,
        local_name: true,
        latin_name: true,
        image: true,
        city: true,
        longitude: true,
        latitude: true,
        habitat: true,
        description: true,
        amount: true,
        updated_at: true
      },
      orderBy: {
        id_animal: 'desc'
      }
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
      image: animal.image,
      amount: animal.amount,
      updated_at: animal.updated_at
    }));

    return res.status(200).json({ status: 200, values: results });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: 'Terjadi kesalahan sistem' });
  }
};

exports.mobeditableanimalid = async (req, res) => {
  const { id_user } = req.decoded;
  const { id_animal } = req.params;

  try {
    if (!id_user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }
    const animal = await prisma.animals.findFirst({
      where: {
        id_user: id_user,
        id_animal: parseInt(id_animal)
      },
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
        date: true,
        updated_at: true
      }
    });

    if (!animal) {
      return res.status(404).json({ status: 404, message: "Animal not found" });
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
      image: animal.image,
      amount: animal.amount,
      id_user: animal.id_user,
      date: animal.date,
      updated_at: animal.updated_at
    };

    return res.status(200).json({ status: 200, values: [result] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: 'Terjadi kesalahan sistem' });
  }
};


exports.mobanimalpost = async (req, res) => {
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
  const { id_user } = req.decoded;


  try {
    if (!id_user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    const animal = await prisma.animals.create({
      data: {
        local_name,
        latin_name,
        habitat,
        description,
        city,
        longitude,
        latitude,
        image,
        amount: parseInt(amount),
        id_user
      }
    });    

    return res.status(200).json({ status: 200, values: animal });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: 'Terjadi kesalahan sistem' });
  }
};

exports.deleteAnimalById = async (req, res) => {
  const { id_animal } = req.params;
  const { id_user } = req.decoded;

  try {
    const animal = await prisma.animals.findUnique({
      where: {
        id_animal: parseInt(id_animal)
      }
    });

    if (!animal) {
      return res.status(404).json({ error: "Animal not found" });
    }

    if (animal.id_user !== id_user) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const imageUrl = animal.image;
    if (imageUrl) {
      const fileId = extractFileIdFromUrl(imageUrl);
      if (fileId) {
        const authClient = await authorize();
        await deleteFileFromDrive(authClient, fileId);
      }
    }

    await prisma.animals.delete({
      where: {
        id_animal: parseInt(id_animal)
      }
    });

    return res.status(200).json({ status: 200, values: { message: "Animal deleted successfully" } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: 'Terjadi kesalahan sistem' });
  }
};


exports.mobediteditableanimal = async (req, res) => {
  const {
    local_name,
    latin_name,
    habitat,
    description,
    city,
    longitude,
    latitude,
    amount,
    image
  } = req.body;
  const { id_user } = req.decoded;
  const date_now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const id_animal = parseInt(req.params.id_animal);

  try {
    // Cek apakah hewan dengan id_animal dan id_user ada
    const animal = await prisma.animals.findFirst({
      where: {
        id_animal,
        id_user,
      },
    });

    if (!animal) {
      return res.status(404).json({ error: "Animal not found" });
    }

    // Lakukan update data hewan
    const updatedAnimal = await prisma.animals.update({
      where: {
        id_animal,
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
        image,
      },
    });

    return res.status(200).json({ status: 200, values: updatedAnimal });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: 'Terjadi kesalahan sistem' });
  }
};

exports.mob_upload_image = async (req, res) => {
  const { id_user } = req.decoded;

  // storage engine
  const storage = multer.memoryStorage();

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB (dalam bytes)
    },
  }).single('image');

  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // Jika terjadi kesalahan dari multer (misalnya melebihi batas ukuran file)
      return res.json({
        success: 0,
        message: err.message,
      });
    } else if (err) {
      // Jika terjadi kesalahan lainnya
      return res.json({
        success: 0,
        message: 'Terjadi kesalahan saat mengunggah gambar',
      });
    }

    if (!req.file) {
      return res.json({
        success: 0,
        message: 'Tidak ada file yang diunggah',
      });
    }

    try {
      const fileName = `${req.file.fieldname}_${id_user + Date.now()}${path.extname(req.file.originalname)}`;
      const fileBuffer = req.file.buffer;

      const authClient = await authorize();
      const fileData = await uploadFileToDrive(authClient, fileName, fileBuffer, 'animals');

      return res.json({
        success: 200,
        fileName: fileData.name,
        fileId: fileData.id,
        fileURL: fileData.webViewLink,
        image_url: `https://drive.google.com/uc?export=view&id=${fileData.id}`,
        message: 'Image uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      return res.status(500).json({
        success: 0,
        message: 'Terjadi kesalahan sistem',
      });
    }
  });
};

// DELETE ANIMAL BY USER
exports.deleteImageByURL = async (req, res) => {
  const imageUrl = req.body.imageUrl;

  if (!imageUrl) {
    return res.status(400).send('Image URL is required');
  }

  try {
    // Ekstrak file ID dari URL Google Drive
    const fileId = extractFileIdFromUrl(imageUrl);

    const authClient = await authorize();
    await deleteFileFromDrive(authClient, fileId);

    const selectImage = await prisma.animals.findFirst({
      where: {
        image: imageUrl
      }
    })

    console.log(selectImage)
    // Hapus informasi gambar dari database menggunakan Prisma
    const deletedImage = await prisma.animals.delete({
      where: {
        id_animal: selectImage.id_animal,
      },
    });

    res.status(200).json({ status: 200, message: 'Image deleted successfully', })
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ status: 500, message: 'Error deleting image' });
  }

};
