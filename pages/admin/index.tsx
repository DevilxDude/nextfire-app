import styles from '../../styles/Admin.module.css';
import { useCollection } from 'react-firebase-hooks/firestore';
import AuthCheck from '../../components/AuthCheck';
// import Metatags from '../../components/Metatags';
import PostFeed from '../../components/PostFeed';
import { auth, firestore, serverTimeStamp } from '../../lib/firebase';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { UserContext } from '../../lib/context';
import KebabCase from 'lodash.kebabcase';
import toast from 'react-hot-toast';

export default function AdminPostsPage({}) {
  return (
    <main>
      {/* <Metatags title="Admin page" /> */}
      <AuthCheck>
        <PostList />
        <CreateNewPost />
      </AuthCheck>
    </main>
  );
}

function PostList() {
  const ref = firestore
    .collection('users')
    .doc(auth.currentUser.uid)
    .collection('posts');
  const query = ref.orderBy('createdAt');
  const [querySnapshot] = useCollection(query);

  const posts = querySnapshot?.docs.map((doc) => doc.data());

  return (
    <>
      <h1>Manage your Posts</h1>
      <PostFeed posts={posts} admin />
    </>
  );
}

function CreateNewPost() {
  const router = useRouter();
  const { username } = useContext(UserContext);
  const [title, setTitle] = useState('');
  const slug = encodeURI(KebabCase(title));
  const isValid = title.length > 3 && title.length < 100;

  const createPost = async (e) => {
    e.preventDefault();
    const uid = auth.currentUser.uid;
    const ref = firestore
      .collection('users')
      .doc(uid)
      .collection('posts')
      .doc(slug);

    const data = {
      title,
      slug,
      uid,
      username,
      published: false,
      content: '# Hello World!',
      createdAt: serverTimeStamp(),
      updatedAt: serverTimeStamp(),
      heartCount: 0,
    };

    await ref.set(data);

    toast.success('Post Created!');

    router.push(`/admin/${slug}`);
  };

  return (
    <form onSubmit={createPost}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="My Awesome Article!"
        className={styles.input}
      />
      <p>
        <strong>Slug:</strong> {slug}
      </p>
      <button type="submit" disabled={!isValid} className="btn-green">
        Create New Post
      </button>
    </form>
  );
}
