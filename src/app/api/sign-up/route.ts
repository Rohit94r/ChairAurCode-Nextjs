import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import UserModel from "@/model/User";

export async function POST(request: Request){
    await dbConnect()
    try {
        const {username, email, password} = await request.json();
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true,
        })
        if(existingUserVerifiedByUsername){
            return Response.json({success: false, message: "Username already exists"}, {status: 400});
        }

        const existingUserVerifiedByEmail = await UserModel.findOne({email})
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        if(existingUserVerifiedByEmail){
            
            if(existingUserVerifiedByEmail.verifiyCode === verifyCode){
                return Response.json({success: false, message: "Email already verified"}, {status: 400});
            }else{
               const hasedPassword = await bcrypt.hash(password, 10);
               existingUserVerifiedByEmail.password = hasedPassword;
               existingUserVerifiedByEmail.verifiyCode = verifyCode;
               existingUserVerifiedByEmail.verifyCodeExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24);
               await existingUserVerifiedByEmail.save();

            }
            
        }else{
           const hasedPassword = await bcrypt.hash(password, 10);
           const expiryDate = new Date();
           expiryDate.setHours(expiryDate.getHours() + 24);

         const newUser =   new UserModel({
            username,
            email,
            password: hasedPassword,
            verifyCode,
            verifyCodeExpiry: expiryDate,
            isVerified: false,
            isAcceptingMessage: true,
            messages: [],
        });
        await newUser.save();
    }

    //send verification email  

    const emailResponse = await sendVerificationEmail(email, username, verifyCode);
    if(!emailResponse.success){
        return Response.json({success: false, message: "Error sending verification email"}, {status: 500});
    }
    return Response.json({success: true, message: "User registered successfully. Please Verify your email"}, {status: 201});
    

    
    if(!emailResponse.success){
        return Response.json({success: false, message: "Error sending verification email"}, {status: 500});
    }
    return Response.json({success: true, message: "User registered successfully"}, {status: 201});

    } catch (error) {
        console.error("Error signing up", error);
        return Response.json({success: false, message: "Error registering user"}, {status: 500});
    }
}