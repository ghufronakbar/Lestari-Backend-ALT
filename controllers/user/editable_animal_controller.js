"use strict";

const fs = require("fs");
const multer = require("multer");
const path = require("path");

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.mobeditableanimals = async (req, res) => {
  const { id_user } = req.decoded;
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const formattedDate = sevenDaysAgo.toISOString().slice(0, 10);

  const { hostname } = req;
  const port = req.port !== undefined ? `:${req.port}` : process.env.PORT !== undefined ? `:${process.env.PORT}` : '';
  const baseUrl = `http://${hostname}${port}`;

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
        updated_at: 'desc'
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
      image: animal.image ? `${baseUrl}/v1/mob/image/animal/${animal.image}` : `${baseUrl}/v1/mob/image/animal/default.png`,
      amount: animal.amount,
      updated_at: animal.updated_at
    }));

    return res.status(200).json({ status: 200, values: results });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: 'Internal Server Error' });
  }
};

exports.mobeditableanimalid = async (req, res) => {
  const { id_user } = req.decoded;
  const { id_animal } = req.params;

  const { hostname } = req;
  const port = req.port !== undefined ? `:${req.port}` : process.env.PORT !== undefined ? `:${process.env.PORT}` : '';
  const baseUrl = `http://${hostname}${port}`;

  try {
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
      image: animal.image ? `${baseUrl}/v1/mob/image/animal/${animal.image}` : `${baseUrl}/v1/mob/image/animal/default.png`,
      amount: animal.amount,
      id_user: animal.id_user,
      date: animal.date,
      updated_at: animal.updated_at
    };

    return res.status(200).json({ status: 200, values: [result] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: 'Internal Server Error' });
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

  const now = new Date();
  const date_now = now.toISOString().slice(0, 19).replace('T', ' ');

  try {
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
        id_user,
        date: new Date(date_now),
        updated_at: new Date(date_now)
      }
    });

    return res.status(200).json({ status: 200, values: animal });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: 'Internal Server Error' });
  }
};
// DELETE ANIMAL BY USER -DONE
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
    const filename = imageUrl ? imageUrl.substring(imageUrl.lastIndexOf('/') + 1) : null;
    const imagePath = filename ? path.join("upload/animals", filename) : null;

    if (filename && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await prisma.animals.delete({
      where: {
        id_animal: parseInt(id_animal)
      }
    });

    return res.status(200).json({ status: 200, values: { message: "Animal deleted successfully" } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: 'Internal Server Error' });
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
        updated_at: date_now,
      },
    });

    return res.status(200).json({ status: 200, values: updatedAnimal });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: 'Internal Server Error' });
  }
};



exports.mob_upload_image = function (req, res) {
  const id_user = req.decoded.id_user;

  // storage engine
  const storage = multer.diskStorage({
    destination: "./upload/animals",
    filename: (req, file, cb) => {
      cb(
        null,
        `${file.fieldname}_${id_user + Date.now()}${path.extname(file.originalname)}`
      );
    },
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB (dalam bytes)
    },
  }).single("image");

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
        message: "Terjadi kesalahan saat mengunggah gambar",
      });
    }

    try {
      // Jika berhasil, Anda dapat mengakses informasi file yang diunggah melalui req.file
      const imageUrl = req.file.filename;

      // Simpan informasi gambar ke database menggunakan Prisma
      const uploadedImage = await prisma.animals.create({
        data: {
          image: imageUrl,
          id_user: id_user,
          // tambahkan kolom lain yang sesuai dengan kebutuhan Anda
        },
      });

      return res.json({
        success: 200,
        image_url: imageUrl,
        message: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      return res.status(500).json({
        success: 0,
        message: "Internal Server Error",
      });
    }
  });
};

// DELETE ANIMAL BY USER
exports.deleteImageByURL = function (req, res) {
  let imageUrl = req.body.imageUrl;

  // Tentukan path direktori tempat file-file diunggah
  const uploadDirectory = path.join(__dirname, "..", "..", "upload", "animals");

  // Menggunakan modul url untuk mengurai URL
  const parsedUrl = new URL(imageUrl);

  // Menggunakan modul path untuk mendapatkan nama file dari path
  const fileName = path.basename(parsedUrl.pathname);
  const filePath = path.join(uploadDirectory, fileName);

  // Cek apakah file ada
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("File not found:", err);
      return res.status(404).send("File not found");
    }

    // Hapus file
    fs.unlink(filePath, async (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        return res.status(500).send("Error deleting file");
      }

      try {
        // Hapus informasi gambar dari database menggunakan Prisma
        const deletedImage = await prisma.animals.deleteMany({
          where: {
            image: fileName,
          },
        });

        console.log("File deleted successfully");
        res.send("File deleted successfully");
      } catch (error) {
        console.error("Error deleting image record from database:", error);
        res.status(500).send("Error deleting image record from database");
      }
    });
  });
};