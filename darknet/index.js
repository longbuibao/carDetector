const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const { spawn } = require('child_process');

const PORT = process.env.PORT || 8000

// default options
app.use(fileUpload());
app.set('view engine', 'ejs');
app.set('views', '../views');


app.get('/', (req, res) => {
    res.render('upload.ejs')
})

app.post('/upload', function(req, res) {
    let sampleFile;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    sampleFile = req.files.sampleFile;
    uploadPath = __dirname + '/data/' + sampleFile.name;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(uploadPath, function(err) {
        if (err)
            return res.status(500).send(err);
        console.log('please wait.....')
        const commandObj = {
            command: './darknet',
            agrs: ['detector', 'test', 'cfg/coco.data', 'cfg/yolov3_training.cfg', 'yolov3_training_10000.weights', `data/${sampleFile.name}`]
        }
        const ls = spawn(commandObj.command, commandObj.agrs)

        ls.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        ls.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        ls.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            res.sendFile(__dirname + '/predictions.jpg', (err) => {
                if (err)
                    res.status(500).send("something wrong")
            })
        });
    });
});

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})