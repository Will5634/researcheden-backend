const path = require('path');
const express = require('express');
const multer = require('multer');
const File = require('../model/file');
const Router = express.Router();
const asyncWrapper = require('../middleware/async')




const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, './files');
    },
    filename(req, file, cb) {
      cb(null, `${new Date().getTime()}_${file.originalname}`);
    }
  }),
  limits: {
    fileSize: 10000000 // max file size 10MB = 10000000 bytes
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|jpg|png|pdf|doc|docx|xlsx|xls)$/)) {
      return cb(
        new Error(
          'only upload files with jpg, jpeg, png, pdf, doc, docx, xslx, xls format.'
        )
      );
    }
    cb(undefined, true); // continue with upload
  }
});

Router.post(
  '/upload',
  upload.single('file'),
  async (req, res) => {
    try {
      const { title, description, department } = req.body;
      const { path, mimetype } = req.file;
      const file = new File({
        title,
        description,
        department,
        file_path: path,
        file_mimetype: mimetype
      });
      await file.save();
      res.send('file uploaded successfully.');
    } catch (error) {
      res.status(400).send('File Upload Might be Successfully, Please Confirm On the HomePage.');
    }
  },
  (error, req, res, next) => {
    if (error) {
      res.status(500).send(error.message);
    }
  }
);

Router.get('/getAllFiles', async (req, res) => {
  try {
    const files = await File.find({});
    const sortedByCreationDate = files.sort(
      (a, b) => b.createdAt - a.createdAt
    );
    res.send(sortedByCreationDate);
  } catch (error) {
    res.status(400).send('Error while getting list of files. Try again later.');
  }
});


Router.get('/getFile/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    //res.status(200).json({file})
    res.send([file])
    
  } catch (error) {
    res.status(400).send('Error while getting file. Try again later.');
  }
});



Router.delete('/deleteFile/:id', async (req, res) => {
  try {
    const {id:taskID} = req.params;
        const task = await File.findOneAndDelete({_id:taskID});
        res.status(200).json({task})
    /*const file = await File.findOneAndDelete(req.params.id);
    res.status(200).json({file})
    res.send(file)*/
    
  } catch (error) {
    res.status(400).send('Error while getting file. Try again later.');
  }
});







Router.get('/download/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    res.set({
      'Content-Type': file.file_mimetype
    });
    res.sendFile(path.join(__dirname, '..', file.file_path));
  } catch (error) {
    res.status(400).send('Error while downloading file. Try again later.');
  }
});


Router.get("/search/:key", async (req, res)=>{
  try {const searchResult = await File.find(
      {
          "$or":[
              {title:{$regex:req.params.key}},
              {department:{$regex:req.params.key}}
          ]
      }
  )
  res.send(searchResult);
    } catch(error) {
      res.status(400).send('Error while searching for file. Try again later.');
    }

});

module.exports = Router;