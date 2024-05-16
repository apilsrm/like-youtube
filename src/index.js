// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from './app.js'
dotenv.config({
    path: './.env'
})



connectDB() //asynch awith conntct hunch it will also return promise
//using this our app use that mangodb database to serve different function called server
.then(() => {
    // app.on("errror", (error) => {
    //     console.log("ERRR: ", error);
    //     throw error
    // })  //we can listen error before  this app.listing, this is optional 
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at :  http://localhost:${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
    console.log(`Error:${err.message}`)
})










/*
import express from "express"
const app = express()
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("errror", (error) => {
            console.log("ERRR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})()

*/