import { useState } from 'react';
import Loader from '../components/Loader';
import PostFeed from '../components/PostFeed';
import { firestore, postToJSON, fromMillis } from '../lib/firebase';

export default function Home(props) {
  const [posts, setPosts] = useState(props.posts);
  const [loading, setLoading] = useState(false);
  const [postsEnd, setPostsEnd] = useState(false);

  const getMorePosts = async () => {
    setLoading(true);

    const last = posts[posts.length - 1];

    let cursor =
      typeof last.createdAt === 'number'
        ? fromMillis(last.createdAt)
        : last.createdAt;

    const query = firestore
      .collectionGroup('posts')
      .where('published', '==', true)
      .orderBy('createdAt', 'desc')
      .startAfter(cursor)
      .limit(LIMIT);

    const newPosts = (await query.get()).docs.map((doc) => doc.data());

    setPosts(posts.concat(newPosts));
    setLoading(false);

    if (newPosts.length < LIMIT) {
      setPostsEnd(true);
    }
  };

  return (
    <main>
      <PostFeed posts={posts} admin={false} />
      {!loading && !postsEnd && (
        <button onClick={getMorePosts}>Load More</button>
      )}
      <Loader show={loading} />
      {postsEnd && 'You have reached the end!'}
    </main>
  );
}

const LIMIT = 10;

export async function getServerSideProps(context) {
  const postsQuery = firestore
    .collectionGroup('posts')
    .where('published', '==', true)
    .orderBy('createdAt', 'desc')
    .limit(LIMIT);

  const posts = (await postsQuery.get()).docs.map(postToJSON);

  return {
    props: { posts },
  };
}
