import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

// at first server storage ma file upload or store huchca aani cloudinary ma upload huncha then server bata remove huncha 

//configuration for clodinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

//to upload on cloudinary from   loaclfilepath
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("File is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}



export {uploadOnCloudinary}