import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user: User | undefined = session?.user;

  if (!session || !user?._id) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  const { messageId } = await params;

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      {
        $pull: {
          messages: { _id: new mongoose.Types.ObjectId(messageId) },
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete message:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to delete message",
      },
      { status: 500 }
    );
  }
}
