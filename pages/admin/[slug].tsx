import styles from '../../styles/Admin.module.css';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import AuthCheck from '../../components/AuthCheck';
import { auth, firestore, serverTimeStamp } from '../../lib/firebase';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import Link from 'next/link';
import ImageUploader from '../../components/ImageUploader';

export default function AdminPostEdit() {
  return (
    <main>
      <AuthCheck>
        <PostManager />
      </AuthCheck>
    </main>
  );
}

function PostManager() {
  const [preview, setPreview] = useState(false);
  const router = useRouter();
  const { slug }: any = router.query;

  const postRef = firestore
    .collection('users')
    .doc(auth.currentUser.uid)
    .collection('posts')
    .doc(slug);
  const [post] = useDocumentDataOnce(postRef);

  return (
    <main className={styles.container}>
      {post && (
        <>
          <section>
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>

            <PostForm
              postRef={postRef}
              defaultValues={post}
              preview={preview}
            />
          </section>

          <aside>
            <h3>Tools</h3>
            <button onClick={() => setPreview(!preview)}>
              {preview ? 'Edit' : 'Preview'}
            </button>
            <Link href={`/${post.username}/${post.slug}`}>
              <button className="btn-blue">Live View</button>
            </Link>
          </aside>
        </>
      )}
    </main>
  );
}

function PostForm({ postRef, defaultValues, preview }) {
  const { register, handleSubmit, reset, watch, formState } = useForm({
    defaultValues,
    mode: 'onChange',
  });

  const { isValid, isDirty } = formState;

  const updatePost = async ({ content, published }) => {
    await postRef.update({
      content,
      published,
      updatedAt: serverTimeStamp(),
    });

    reset({ content, published });

    toast.success('Post updated successfully!');
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className="card">
          <ReactMarkdown>{watch('content')}</ReactMarkdown>
        </div>
      )}

      <div className={preview ? styles.hidden : styles.controls}>
        <ImageUploader />
        <textarea
          name="content"
          // ref={register('content', {
          //   maxLength: { value: 2000, message: 'Content is too long.' },
          //   minLength: { value: 10, message: 'Content is too short.' },
          //   required: { value: true, message: 'Content is required.' },
          // })}
          {...register('content', {
            maxLength: { value: 2000, message: 'Content is too long.' },
            minLength: { value: 10, message: 'Content is too short.' },
            required: { value: true, message: 'Content is required.' },
          })}
        ></textarea>
        {formState.errors.content && (
          <p className="text-danger">{formState.errors.content.message}</p>
        )}

        <fieldset>
          <input
            type="checkbox"
            name="published"
            className={styles.checkbox}
            // ref={register('published')}
            {...register('published')}
          />
          <label>Published</label>
        </fieldset>
      </div>

      <button
        type="submit"
        className="btn-green"
        disabled={!isValid || !isDirty}
      >
        Save Changes
      </button>
    </form>
  );
}
