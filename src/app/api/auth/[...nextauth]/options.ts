import NextAuth from "next-auth";
import {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                username: {label: "Username", type: "text", placeholder: "jsmith"},
                email: {label: "Email", type: "email", placeholder: "jsmith@example.com"},
                password: {label: "Password", type: "password", placeholder: "********"},
            },
            async authorize(credentials:any): Promise<any> {
                await dbConnect();
                try {
                   const user =  await UserModel.findOne({
                        $or: [
                            {email: credentials.identifier},
                            {username: credentials.identifier}
                        ]

                    })
                    if(!user){

                        throw new Error('No user fount with this email')
                    }

                    if(!user.isVerified) {
                        throw new Error('Please Verify you account first')
                    }
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
                if(isPasswordCorrect){
                    return user
                }else{
                    throw new Error('Invalid Password')
                }
                } catch (error:any) {
                    throw new Error(error.message)
                }

            }

        })
    ],
    callbacks:{
        async jwt({token, user}: any) {
            if(user){
                token._id= user._id?.toString()
                token.isVerified= user.isVerified
                token.isAcceptingMessages= user.isAcceptingMessages;
                token.username= user.username;
            }
            return token
        },
        async session({session, token}) {
            if(token){
                session.user._id= token._id
                session.user.isVerified= token.isVerified
                session.user.isAcceptingMessages= token.isAcceptingMessages
                session.user.username= token.username
            }
            return session
        }
    },
    pages:{
        signIn: '/sign-in',
        
    },
    session:{
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
}