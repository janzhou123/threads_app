import ThreadCard from '@/components/cards/ThreadCard'
import { fetchThreadById } from '@/lib/actions/thread.actions';
import { fetchUser } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import React from 'react'
import Comment from '@/components/forms/Comment';

const page = async ({ params }: { params: { id: string } }) => {
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const post = await fetchThreadById(params.id);

  return (
    <>
      <section className='relative'>
        <div>
          <ThreadCard
            key={post._id}
            id={post._id}
            currentUserId={user.id}
            parentId={post.parentId}
            content={post.text}
            author={post.author}
            community={post.community}
            createdAt={post.createdAt}
            comments={post.children}
          />
        </div>
        <div className='mt-7'>
          <Comment
            threadId={params.id}
            currentUserImg={user.imageUrl}
            currentUserId={JSON.stringify(userInfo._id)}
          />
        </div>
        <div className='mt-10'>
          {post.children.map((childItem: any) => (
            <ThreadCard
              key={childItem._id}
              id={childItem._id}
              currentUserId={childItem.id}
              parentId={childItem.parentId}
              content={childItem.text}
              author={childItem.author}
              community={childItem.community}
              createdAt={childItem.createdAt}
              comments={childItem.children}
              isComment
            />
          ))}
        </div>
      </section>
    </>
  )
}

export default page