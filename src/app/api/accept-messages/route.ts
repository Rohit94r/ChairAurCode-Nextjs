import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import {User} from "next-auth";
import { get } from "http";

export async function POST(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user;

    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "Unauthorized",
            },
            {status: 401}
        )
    }
    const userId = user._id;
    const {acceptMessages} = await request.json();
         try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId, {acceptMessages}, {new: true});   
            if(!updatedUser) {
                return Response.json(
                    {
                        success: false,
                        message: "User not found",
                    },
                    {status: 404}
                )
            }
            return Response.json(
                {
                    success: true,
                    message: "User status updated to accept messages",
                    updatedUser,
                },
                {status: 200}
            )
        } catch(error){
            console.log("Failed to update user status to accept messages:", error);
            return Response.json(
                {
                    success: false,
                    message: "Failed to aupdate user status to accept messages",
                },
                {status: 500}
            )
        }
    }

export async function GET(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user;

    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "Unauthorized",
            },
            {status: 401}
        )
    }
    const userId = user._id;
    try {
        const foundUser = await UserModel.findById(userId, {acceptMessages: 1});
    if(!foundUser) {
        return Response.json(
            {
                success: false,
                message: "User not found",
            },
            {status: 404}
        )
    }
    return Response.json(
        {
            success: true,
            message: "User found",
            isAcceptingMessages: foundUser.isAcceptingMessage,
        },
        {status: 200}
    )
    } catch (error) {
        console.log("Failed to get user status to accept messages:", error);
        return Response.json(
            {
                success: false,
                message: "Failed to get user status to accept messages",
            },
            {status: 500}
        )
    }

    
}
