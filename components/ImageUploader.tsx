import { useState } from 'react';
import { auth, STATE_CHANGED, storage } from '../lib/firebase';
import Loader from './Loader';

export default function ImageUploader() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState(null);

  const uploadFile = async (e) => {
    const file = Array.from(e.target.files)[0];
    const extention = file.type.split('/')[1];

    const ref = storage.ref(
      `uploads/${auth.currentUser.uid}/${Date.now()}.${extention}`
    );
    setDownloadURL(null);
    setUploading(true);

    const task = ref.put(file);

    task.on(STATE_CHANGED, (snapshot) => {
      const pct = (
        (snapshot.bytesTransferred / snapshot.totalBytes) *
        100
      ).toFixed(0);
      setProgress(pct);
    });

    task
      .then((d) => ref.getDownloadURL())
      .then((URL) => {
        setDownloadURL(URL);
        setUploading(false);
      });
  };

  return (
    <div className="box">
      <Loader show={uploading} />
      {uploading && <h3>{progress}%</h3>}
      {!uploading && (
        <label className="btn">
          📸 Upload Img
          <input
            type="file"
            onChange={uploadFile}
            accept="image/x-png,image/gif,image/jpeg,image/jpg"
          />
        </label>
      )}
      {downloadURL && (
        <code className="upload-snippet">{`![alt](${downloadURL})`}</code>
      )}
    </div>
  );
}
