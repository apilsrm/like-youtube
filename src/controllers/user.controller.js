import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)

        //therse r methods ho 
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
       
        //aba save
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
            //dont do validation just save = validateBeforeSave  aafai kam huncha yo db ma 
        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);
    
    // if(fullName ===""){
    //     throw new ApiError(400, "fullname is rquired")
    // } validation for fullname 

       // check for all fileds using [array]method yesma .some methods xa(like.map methods in array yo pani euta methods)
       //.some A function that accepts up to three arguments. The some method calls the predicate function for each element in the array until the predicate returns a value which is coercible to the Boolean value true, or until the end of the array.
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "") //(.map jheu xa so use this) if field xa use optinal lagayar trim garni  then trim garepani field empty xa bhanea then automatically return true. sab lai check garxa if euta pani khalixa vanea true return garxa
    ) {
        throw new ApiError(400, "All fields are required")
    }

 //to check user exist or not 
 // User.findOne()-Fetches a single document from the MongoDB collection that matches the provided query.
 //find one its find n return user jo paila vetinxa tei
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    }) // or method ho ..its return jo first math garxa user or email
    //This is a MongoDB query operator. The $or operator is used to specify that the query should match documents where at least one of the given conditions is true

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    //multer le req.files ko excess dinxa use optional  file huna ni sakxa  nahunani sakxa
    const avatarLocalPath = req.files?.avatar[0]?.path; //its (multer) give proper file path
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    
  //check for avatar
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
      //upload on cloudinary  its takes time to upload so use await ..aagadi ko code run nai nahuni jabtak upload complete nahos
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    } //coverImage is optional xa so we dont check but we can check no  problems
   
     //to create file in db  use store image ko url 
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    ) // default all select garxa  n retrun garda ma password r token na pathauni or dekhauni but db ma save xa mathi ko code le 
 
    //check user register or create vayo ki nai
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
 
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )

const loginUser = asyncHandler( async (req, res) => {
    //req body-> data
    //username or email
    //find user
    //password check
    //access and refresh token
    //send token through cookies

    const {email, username, password } = req.body
    console.log(email)

    //we need username or email 2 oatai xaina vanea yo run huncha
    if(!username && !email) {
        throw new ApiError(400, "username or email is required");

    }
    // alternative of above code
     // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    ///User momgodb bata tanna paresi
    //user chai hamilebanako method haru user garna lai like generate token password check user.model ma x

    const user = await User.findOne({
        $or: [{username}, {email}]
    })//we find on based username or email yo code ma  ,or operator mongodb ko ho [arry {object}, {}] arry ko inside obj

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    //check password
   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }
 
    //generate token here
   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)
    
   //mathi ko user ma token empty xa kina ni hamile  generate token  tala gareko xam so User 
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
   
    //now for cookies 
    const options = {
        httpOnly: true,
        secure: true
    } //this name cookies only modified by server ..both fornt r back ma dekinxa but cont modified by other due to  httpOnly: true, secure: true

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    //we get user through middlewere verifyjwt
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }//return res ma new updated value milxa yesle
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
         
        //get user  form db throught token  userid 
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async(req, res) => {
   
    const {oldPassword, newPassword} = req.body
   //const {oldPassword, newPassword, confirmPassword} = req.body
   //if(!newPassword === confirmPassword) {
   // throw new ApiError(400, "password must match")
  // }

    

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

 
//due to middlewar  req.user= user xa middleware ma so we esaily get user from req only if user is logined
const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

//make file update and  data update seperate 
const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName,
                email: email
            }
        },
        {new: true}//this return information after update ie updated information
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path   //we need only one file so  req.file?.path not files

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }
//old image can de deleted

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    //TODO: delete old image - assignment


    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})


const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    } //trim() le whitespace harauxa 

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            } //subscriptions = Subscription db ma modeles plular save huncha so 
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]}, // $__ = filed ho $ le garda,  $subscribers.subscriber vitra  req.user?._id xa ki nai herni if xa true if not false
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            } //flag 1 means  yo value dini  or chahinxa  jun jun filed dini tei ma lekhni
        }
    ])

    //console.log(channel);
    //check channel xaki nai 
    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            } //mongoose bata object id banakoho 
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}