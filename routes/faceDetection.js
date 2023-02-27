import fs from 'fs';

const faceDetection = (req, res, next) => {
    if (!req.authorizedUser) {
        fs.unlink(req.file.path, err => {
            if (err) console.log(err);
        });
        return res.status(403).json({
            status: 'unauthorized'
        })
    }

    // Clarifai logic
    console.log(req?.file);
    return res.status(200).json({
        status: 'success'
    })
}

export default faceDetection;