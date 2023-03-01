import fs from 'fs';
import { ClarifaiStub, grpc } from 'clarifai-nodejs-grpc';

const domain = "https://soft-humans-return-179-6-54-221.loca.lt";

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
    // console.log(req?.file);
    const imageFolder = req.file.destination.split("/").at(-1);
    // const imageURL = `${domain}/${imageFolder}/${req.file.filename}`;
    const imageURL = "https://occ-0-41-300.1.nflxso.net/dnm/api/v6/E8vDc_W8CLv7-yMQu8KMEC7Rrr8/AAAABbFI2wcwiGkHDdGWaw58hWgLETOBsbqqv6GbKnZFn3s_Y4fjw0Ys9DNYD5txnfV3oj9tgsBeaSnPcBOwQqQnpHVqHeQr9FtvVzaL.jpg?r=776";
    // console.log(imageURL);

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