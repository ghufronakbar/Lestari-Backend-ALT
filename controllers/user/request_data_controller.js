"use strict"

const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const { uploadFileToDrive } = require('../../lib/uploadFileToDrive');
const { authorize } = require('../../lib/authorize');
const prisma = new PrismaClient();
const path = require("path");


exports.mobhistoryrequestdata = async function (req, res) {  
  try {
    const id_user = req.decoded.id_user;
    const requestDatas = await prisma.request_Datas.findMany({
      where: {
        id_user: id_user,
      },
      orderBy: {
        date: 'desc',
      },
      select: {
        id_request_data: true,
        name: true,
        email: true,
        profession: true,
        instances: true,
        subject: true,
        body: true,
        date: true,
        approve: true,
        url: true,
        id_user: true,
      },
    });

    const formattedResult = requestDatas.map(row => ({
      id_request_data: row.id_request_data,
      name: row.name,
      email: row.email,
      profession: row.profession,
      instances: row.instances,
      subject: row.subject,
      body: row.body,
      date: row.date,
      approve: row.approve,
      url: row.url,      
      id_user: row.id_user,
    }));

    return res.status(200).json({ status: 200, values: formattedResult });
  } catch (error) {
    console.error("Error fetching history request data:", error);
    return res.status(500).send("Internal Server Error");
  }
};

exports.mobhistoryrequestdatabyid = async function (req, res) {

  try {
    const id_request_data = parseInt(req.params.id_request_data); 
    if(isNaN(id_request_data)){
      return res.status(400).json({
        status: 400,
        message: "Invalid request data ID",
      });
    }   
    const requestData = await prisma.request_Datas.findFirst({
      where: {
        id_request_data: id_request_data,
      },
    });

    if (!requestData) {
      return res.status(404).json({
        status: 404,
        message: "Request data not found",
      });
    }

    const formattedResult = {
      id_request_data: requestData.id_request_data,
      name: requestData.name,
      email: requestData.email,
      profession: requestData.profession,
      instances: requestData.instances,
      subject: requestData.subject,
      body: requestData.body,
      date: requestData.date,
      approve: requestData.approve,
      url: requestData.url,
      id_user: requestData.id_user,
    };

    return res.status(200).json({ status: 200, values: formattedResult });
  } catch (error) {
    console.error("Error fetching history request data by ID:", error);
    return res.status(500).send("Internal Server Error");
  }
};

exports.mobaddrequestdata = async function (req, res) {
  const { profession, instances, subject, body, attachment } = req.body;
  try {
    const id_user = req.decoded.id_user;        

    if(!profession || !instances || !subject || !body || !attachment) {
      return res.status(400).json({
        status: 400,
        message: "Field tidak boleh kosong",
      });
    }   

    
    const userData = await prisma.users.findUnique({
      where: {
        id_user: id_user,
      },
      select: {
        name: true,
        email: true,
      },
    });

    if (!userData) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    const { name, email } = userData;

    const now = new Date();
    const date_now =
      now.getFullYear() +
      "-" +
      ("0" + (now.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + now.getDate()).slice(-2) +
      " " +
      ("0" + now.getHours()).slice(-2) +
      ":" +
      ("0" + now.getMinutes()).slice(-2) +
      ":" +
      ("0" + now.getSeconds()).slice(-2);

      const newRequestData = await prisma.request_Datas.create({
        data: {
          name: name,
          email: email,
          profession: profession,
          instances: instances,
          subject: subject,
          body: body,        
          approve: 0,
          id_user: id_user,
          url: "",
          attachment: attachment
        },
      });
     
      return res.status(200).json({
        status: 200,
        message: "Permintaan data diterima, cek berkala email!",
      })
         
  } catch (error) {
    console.error("Error adding request data:", error);
    return res.status(500).send("Internal Server Error");
  }
};

exports.uploadAttachment = async (req, res) => {
  const storage = multer.memoryStorage();

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024, 
    },    
  }).single('image');

  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // Jika terjadi kesalahan dari multer (misalnya melebihi batas ukuran file)
      return res.status(500).json({
        status: 500,
        success: 0,
        message: err.message,
      });
    } else if (err) {
      // Jika terjadi kesalahan lainnya
      return res.status(500).json({
        status: 500,
        success: 0,
        message: 'Terjadi kesalahan saat mengunggah gambar',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status : 400,
        success: 0,
        message: 'Tidak ada file yang diunggah',
      });
    }

    try {
      const fileName = `${req.file.fieldname}_${Date.now()}${path.extname(req.file.originalname)}`;
      const fileBuffer = req.file.buffer;

      const authClient = await authorize();
      const fileData = await uploadFileToDrive(authClient, fileName, fileBuffer, 'request');    

      return res.json({
        success: 200,
        fileName: fileData.name,
        fileId: fileData.id,
        fileURL: fileData.webViewLink,
        image_url:  `https://drive.google.com/uc?export=view&id=${fileData.id}`,
        keterangan: "Berhasil mengunggah gambar",
    }
  ); 

     
    } catch (error) {
      console.error('Error uploading image:', error);
      return res.status(500).json({
        success: 0,
        message: 'Internal Server Error',
      });
    }
  });
}


exports.requestDataGuest = async (req, res) => {
  const { name, email, profession, instances, subject, body } = req.body;

  if (!name || !email || !profession || !instances || !subject || !body) {
    return res.status(400).json({ status: 400, message: "Field tidak boleh kosong" });
  }

  try {
    const newRequestData = await prisma.request_Datas.create({
      data: {
        name: name,
        email: email,
        profession: profession,
        instances: instances,
        subject: subject,
        body: body,
        approve: 0,
        id_user: 0,
        url: "",
      },
    });

    return res.status(200).json({ status: 200, message: "Permintaan data diterima, cek berkala email!" });
  } catch (error) {
    console.error("Error creating request data:", error);
    return res.status(500).json({ status: 500, message: "Internal Server Error!" });
  }
};