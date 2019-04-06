const express = require('express');
const app = express();
const path = require('path')
const socket = require('socket.io');
const sha=require('sha256')
const formidable = require('formidable');
const fs =require('fs')
const Jimp= require('jimp');
var upload_path = "/Users/mukundhbhushan/Desktop/projects/shaimp/public/public"

app.set('view engine', 'ejs')

app.use(express.urlencoded({
    extended: true
}));


app.set('views',path.join(__dirname,'views'))

app.get('/',(req,res)=>{
    res.render("hello.ejs")
})

app.get('/text',(req,res)=>{
    res.render('text.ejs')
})

app.get('/image',(req,res)=>{
    res.render('image.ejs')
})
app.get('/file',(req,res)=>{
    res.render('file.ejs')
})

app.post('/file',(req,res)=>{
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        // oldpath : temporary folder to which file is saved to
        var oldpath = files.filetoupload.path;
        var newpath = upload_path + files.filetoupload.name;
        console.log(oldpath,newpath)
        // copy the file to a new location
        fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;
            // you may respond with another html page

            console.log('File uploaded and moved!');
        });
        
        var contents = fs.readFileSync(oldpath, 'utf8');
        contents=sha(contents)
        //contents=`the hash for file ${files.filetoupload.name} is ${sha(contents)}`
        
        res.render('file_upload.ejs',{filename:files.filetoupload.name,hash:contents})

    });
})


app.post('/image',(req,res)=>{
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        // oldpath : temporary folder to which file is saved to
        var oldpath = files.filetoupload.path;
        var newpath = upload_path + files.filetoupload.name;
        console.log(oldpath,newpath)
        // copy the file to a new location
        fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;
            // you may respond with another html page

            console.log('File uploaded and moved!');
        });
        Jimp.read(newpath, (err, lenna) => {
            if (err) throw err;
            lenna
              .resize(256, 256) // resize
              .quality(60) // set JPEG quality
              .greyscale() // set greyscale
              .write(newpath); // save
          });
        //   fs.readFile(newpath, function(err, data) {
        //     if (err) throw err;
          
        //     // Encode to base64
        //     var encodedImage = new Buffer(data, 'binary').toString('base64');
        //   });
        var contents = fs.readFileSync(newpath, 'utf8');
        contents=new Buffer(contents,'binary').toString('base64')
        //console.log(files)
        contents=sha(contents)
        
        res.render('image_upload',{filename:files.filetoupload.name,hash:contents});
    })
})

var server = app.listen(3000,()=>{
    console.log("server running on 3000")
})

var io = socket(server);



io.on('connection', (socket) => {

    console.log('made socket connection', socket.id);

    // Handle chat event
    socket.on('chat', function(data){
        console.log(data);
        data.sha=sha(data.message)
        io.sockets.emit('chat', data);
    });


});

