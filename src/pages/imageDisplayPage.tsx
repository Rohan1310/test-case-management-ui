import { useParams } from 'react-router-dom';
import { getAttachment } from '../services/testCases';
import { useEffect, useState } from 'react';

const ImageDisplayPage = () => {
  const { filename } = useParams();
  const [imageUrl , setImageUrl] = useState("");
  
  useEffect(()=>{
    (getAttachment(filename || "")).then((res:any)=>{
        setImageUrl(res?.request?.responseURL)
    })
  },[])

  return (
    <div>
      <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '100%', height: 'auto' }} />
    </div>
  );
};

export default ImageDisplayPage;