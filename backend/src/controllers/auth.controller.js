import cloudinary from "../lib/cloudinary.js"
import { generateToken } from "../lib/utils.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

export const signup = async(req , res)=>{
    try{
        const {fullName , email , password} = req.body
        if(!fullName || !email || !password){
            return res.status(400).json({message : "all fields are required"})
        }
        //hash passwords
        if(password.length < 6){
            return res.status(400).json({message : "MINIMUM 6 characters for password"})
        }
        const user = await User.findOne({email})
        if(user){
            return res.status(400).json({message : "MINIMUM 6 characters for password"})
        }
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password , salt)

        const newUser = new User({
            fullName,
            email,
            password: hashPassword
        })
        if(newUser){
            //generate jwt token here
            generateToken(newUser._id , res)
            await newUser.save()
            res.status(201).json({
                _id : newUser._id,
                fullName : newUser.fullName,
                email : newUser.email,
                profilePic : newUser.profilePic
            })
        } else{
            res.status(400).json({message:"Invalis user data"})
            res.status(500).json({message : "Internal error"})
        }

    } catch(error){

    }
}

export const login = async(req , res) =>{
    const {email , password} = req.body
    try{
        const user = await User.findOne({email})
        if(!user){
            res.status(400).json({message : "Invalid credentials"})
        }

        const isPasswordCorrect = await bcrypt.compare(password , user.password)
        if(!isPasswordCorrect){
            return res.status(400).json({message : "Invalid credentials"})
        }

        generateToken(user._id , res)

        res.status(200).json({
            id:user._id,
            fullName: user.fullName,
            email:user.email,
            profilePic : user.profilePic
        })
    }catch(e){
        console.log("Error in login controller");
        res.status(500).json({message : "Internal server error"})
    }
}

export const logout = (req , res) =>{
    try{
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({message : "Logged out successfully"})
    } catch(e){
        console.log("Error in logout controller");
        res.status(500).json({message : "Internal server error"})
    }
}

export const updateProfile = async(req , res) =>{
    try{
        const {profilePic} = req.body
        const userId = req.user._id

        if(!profilePic){
            return res.status(400).json({message : "Profile pic not provided"})
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic)

        const updatedUser = await User.findByIdAndUpdate(userId , {
            profilePic:uploadResponse.secure_url
        } , {new : true})

        res.status(200).json(updatedUser)
    }catch(E){

    }
}

export const checkAuth = async(req , res) =>{
    try{
        res.status(200).json(req.user);
    } catch(e){
        console.log("Error in checkAuth controller" , error.message);
        res.status(500).json({message : "Internal server error"})
        
    }
}