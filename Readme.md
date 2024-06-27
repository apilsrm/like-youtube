

 ## Table of Contents
    Description/Summary
    Prerequisites
    Installation
    Usage
    Contributing
    Questions

## Project Summary

This project is a robust backend built with Node.js, Express.js, and MongoDB, designed to handle a variety of operations for a social media-like platform. The backend architecture includes several key components:

**User Controller**: Manages user registration, login, logout, and other user-related functionalities.

**Video Controller**: Enables users to perform CRUD operations on videos.

**Comment and Community Post Controller**: Allows users to create, read, update, and delete comments and community posts.

**Like Controller**: Facilitates user interaction by enabling likes or dislikes on videos, comments, and community posts.

**Dashboard Controller**: Provides an overview of user activities and interactions.

The project aims to build a complete video hosting website similar to YouTube, featuring comprehensive functionalities such as login, signup, video uploads, likes, dislikes, comments, replies, subscriptions, and more. This backend serves as a solid foundation for the future development of a full-stack social media application.

Project uses all standard practices like JWT, bcrypt, access tokens, refresh Tokens and many more. 


## Prerequisites

Before you begin, ensure you have met the following requirements:
```
- You have installed the latest version of Node.js and npm.
- You have a Windows/Linux/Mac machine.
- You have read guide to Express.js.
- You have a basic understanding of JavaScript and MongoDB.
- You have MongoDB installed or have a MongoDB Atlas account.
```


## Installation
Follow these steps to get the project set up on your local machine:

1. Clone the repository: First, you will need to clone the repository to your local machine. You can do this with the following command:
```
git clone https://github.com/apilsrm/like-youtube.git
```
2. Navigate to the project directory: Change your current directory to the project's directory:

3. Install the dependencies: Now, you can install the necessary dependencies for the project:

```
npm install
npm install -g nodemon
npm install dotenv cloudinary mongoose mongoose-aggregate-paginate-v2 bcrypt jsonwebtoken express cors cookie-parser cloudinary multer
```

4. Set up environment variables: Copy the *sampleforenv* file and rename it to *.env*. Then, fill in the necessary environment variables.

5. Start the server: Now  you can start the server:

```
npm run dev
```

Now, you should be able to access the application at http://localhost:4000 (or whatever port you specified).



## Usage
This project is a backend application, so you'll interact with it using API endpoints. Here are some examples:

**User Registration**
To register a new user, send a POST request to */api/v1/users/register* with the following data:
```
{
  "username": "test",
  "email": "test@email.com",
  "password": "test123",
  "fullName": "Test User",
  "avatar": "avatar.jpg",
  "coverImage": "coverImage.jpg",
}
```

**User Login**
To login, send a POST request to */api/v1/users/*login with the following data:

```
{
  "email": "example@email",
  "password": "examplepassword"
}
```

**User Logout**
To logout, send a POST request to */api/v1/users/*logout .

And Many more:
There a lot of endpoint you can see in routes.


## Contributing
This project is open source and it is based on learning, this project is from "Chai-aur-code" youtube channel. Where i complete the all the assignment which enhanced my skilled on Mongodb , Node,  Express,  Tokens etc 

Many new concept link aggregate, pipeline . This involves several stages, including matching, lookup, and many more projecting specific fields.

   *For Example:* 
 In this above code :
   - $match-match stage
   - $lookup- lookupstageEmbedding Watch History Videos
   - inner Lookup Stage (Embedding Video Owners)
   - $addFields- used to add new fields to documents
   etc.

```
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

```

## Questions
If you have any questions or feedback, please feel free to reach out to me via Email or GitHub.
