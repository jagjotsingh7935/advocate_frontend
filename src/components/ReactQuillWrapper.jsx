import React, { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ReactQuillWrapper = ({ value, onChange, placeholder, modules, formats, className, style }) => {
  const [isMounted, setIsMounted] = useState(false);
  const quillRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) {
    return (
      <div 
        style={{ 
          height: '110px', 
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px',
          backgroundColor: '#f5f5f5'
        }} 
      >
        Loading editor...
      </div>
    );
  }

  return (
    <ReactQuill
      ref={quillRef}
      theme="snow"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      modules={modules}
      formats={formats}
      className={className}
      style={style}
    />
  );
};

export default ReactQuillWrapper;