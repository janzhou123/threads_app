"use server";
import { connectToDB } from "../mongoose";
import Community from "../models/community.model";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { relative } from "path";
import { revalidatePath } from "next/cache";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export const createThread = async ({
  text,
  author,
  communityId,
  path,
}: Params) => {
  try {
    connectToDB();
    const createThread = await Thread.create({
      text,
      author,
      community: null,
    });

    await User.findByIdAndUpdate(author, {
      $push: { threads: createThread._id },
    });
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create/update thread: ${error.message}`);
  }
};

export const fetchPosts = async (pageNumber = 1, pageSize = 20) => {
  try {
    connectToDB();
    const skipAmount = (pageNumber - 1) * pageSize;
    // fetch the post that have no parents top-level threads
    const fethcQuery = Thread.find({
      parentId: { $in: [null, undefined] },
    })
      .sort({ createAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id name parentId image",
        },
      });

    const totalPostsCount = await Thread.countDocuments({
      parentId: { $in: [null, undefined] },
    });

    const posts = await fethcQuery.exec();

    const isNext = totalPostsCount > skipAmount + posts.length;
    return { posts, isNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`);
  }
};

export const fetchThreadById = async (id: string) => {
  connectToDB();

  try {
    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "community",
        model: Community,
        select: "_id id name image",
      }) // Populate the community field with _id and name
      .populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
          {
            path: "children", // Populate the children field within children
            model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
          },
        ],
      })
      .exec();
    return thread;
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`);
  }
};

export const addCommentToThread = async (
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) => {
  connectToDB();
  try {
    const oldThread = await Thread.findById(threadId);
    if (!oldThread) {
      throw new Error("Thread not found");
    }

    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });
    const saveCommentThread = await commentThread.save();

    oldThread.children.push(saveCommentThread._id);

    await oldThread.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to add comment: ${error.message}`);
  }
};
