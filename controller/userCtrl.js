const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const { find } = require("../models/userModel");
const { generateToken } = require("../config/jwtToken");
const { validateMongoDbId } = require("../utills/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require('jsonwebtoken');

const createUser = asyncHandler(async(req, res) =>{
        const email = req.body.email;
        const findUser = await User.findOne({email: email});
        if(!findUser){
            //Create a new user
            const newUser = await User.create(req.body);
            res.json({newUser});
        }else{
            //User already exist
            // res.json({
            //     message: "User already exists",
            //     success: false,
            // })
            throw new Error("User already exists");
        }
});


const loginUserCtrl = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    //Check if user exists or not
    const findUser = await User.findOne({email});
    if(findUser && await findUser.isPasswordMatched(password)){
        const refreshToken = await generateRefreshToken(findUser?._id);
        const udateuser = await User.findByIdAndUpdate(findUser?.id, {
            refreshToken: refreshToken,
        },{new:true});
        res.cookie("refreshToken", refreshToken, {
            httpOnly:true,
            maxAge:72*60*60*1000,
        });
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
        });
    }else{
        throw new Error("Invalid credentials")
    }
});

//Get all user
const getAllUser = asyncHandler(async (req, res) => {
    try {
        const getUsers = await User.find();
        res.json({getUsers});
    } catch (error) {
        throw new Error(error);
    }
})

//Ger a single user
const getSingleUser = asyncHandler(async (req, res) => {
    const  {id} = req.params;
    validateMongoDbId(id);
    try {
        const getSingleUser = await User.findById(id);
        res.json({getSingleUser});
    } catch (error) {
        throw new Error(error);
    }
});

//Handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if(!cookie?.refreshToken){
        throw new Error("No refresh token in cookies")
    }
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken});
    if (!user) {
        throw new Error("No refresh token present in db or not matched");
    }
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if(err || user.id != decoded.id){
            throw new Error("There is something wrong with refresh toen");
        }
        const accessToken = generateToken(user?._id);
        res.json({accessToken});
    });
});

//Logout functionality
const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if(!cookie?.refreshToken){
        throw new Error("No refresh token in cookies")
    }
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken});
    if(!user){
        res.clearCookie("refreshToken", {
            httpOnly:true,
            secure:true,
        });
        return res.sendStatus(204); //Forbidden
    }
    await User.findOneAndUpdate(refreshToken, {
       refreshToken: "",
    });
    res.clearCookie("refreshToken", {
        httpOnly:true,
        secure:true,
    });
    return res.sendStatus(204); //Forbidden
})

//Update a user
const updateAUser = asyncHandler(async (req, res) => {
    const  {_id} = req.user;
    validateMongoDbId(_id);
    try {
        const updateAUser = await User.findByIdAndUpdate(_id, {
            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname,
            email: req?.body?.email,
            mobile: req?.body?.mobile,
        },{new: true,});
        res.json({updateAUser});
    } catch (error) {
        throw new Error(error);
    }
})

//Delete a user
const deleteAUser = asyncHandler(async (req, res) => {
    const  {id} = req.params;
    validateMongoDbId(id);
    try {
        const deleteAUser = await User.findByIdAndDelete(id);
        res.json({deleteAUser});
    } catch (error) {
        throw new Error(error);
    }
});

//
const blockUser = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const block = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: true,
            },
            {
                new: true,
            }
        );
        res.json({
            message: "User Blocked",

        });
    } catch (error) {
        throw new Error(error);
    }
});

const unblockUser = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const unblock = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: false,
            },
            {
                new: true,
            }
        );
        res.json({
            message: "User UnBlocked",

        });
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {createUser, loginUserCtrl,
    getAllUser, getSingleUser,
    deleteAUser, updateAUser, 
    blockUser, unblockUser, handleRefreshToken,
    logout,
};