const faceDetection = (fs, ClarifaiStub, grpc) => (req, res) => {
    if (!req.authorizedUser) {
        fs.unlink(req.file.path, err => {
            if (err) console.log(err);
        });
        return res.status(403).json({
            status: 'unauthorized'
        })
    }

    // Clarifai logic
    const imageFolder = req.file.destination.split("/").at(-1);
    const imageURL = `${process.env.SERVER_DOMAIN}/${imageFolder}/${req.file.filename}`;

    const stub = ClarifaiStub.grpc();
    const metadata = new grpc.Metadata();
    metadata.set("authorization", `Key ${process.env.PAT}`);

    stub.PostModelOutputs(
        {
            user_app_id: {
                "user_id": process.env.USER_ID,
                "app_id": process.env.APP_ID
            },
            model_id: process.env.MODEL_ID,
            inputs: [
                { data: { image: { url:  imageURL } } }
            ]
        },
        metadata,
        (err, response) => {
            fs.unlink(req.file.path, err => {
                if (err) console.log(err);
            });
            
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: 'fail'
                })
            }

            if (response.status.code !== 10000) {
                console.log("Post model outputs failed: " + response.outputs[0].status.description);
                console.log("Details: " + response.outputs[0].status.details);
                return res.status(500).json({
                    status: 'fail'
                })
            }

            const regions = response.outputs[0].data.regions;
            
            const detectionData = regions.map((region) => {
                const boundingBox = region.region_info.bounding_box;
                const faceDetection = {
                    name: region.data.concepts[0].name,
                    probability: region.data.concepts[0].value
                }
                return {
                    boundingBox,
                    faceDetection
                }
            })

            return res.status(200).json({
                status: 'success',
                detectionData
            })
        }
    )
}

export default faceDetection;