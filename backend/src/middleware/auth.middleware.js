import jwt from "jsonwebtoken"

import User from "../models/user.model.js"

export const protectRoute = async(req ,res , next) =>{
    // console.log("In protect route middleware");
    
    try {
        const token = req.cookies.jwt
        if(!token){
            return res.status(400).json({message : "Unauthorized - no token provided"})
        }
        const decoded = jwt.verify(token , process.env.JWT_SECRET)
        if(decoded == false){
            return res.status(400).json({message : "Unauthorized - Invalid token"})
        }
        const user = await User.findById(decoded.userId).select("-password")

        if(!user){
            return res.status(404).json({message : "User not found"})
        }
        req.user = user
        next()
    } catch (error) {
        console.log("Error in protectRoute middleware");
        return res.status(500).json({message : "Internal server error"})
        
    }
} 