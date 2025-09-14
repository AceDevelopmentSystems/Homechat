import React, { useState } from 'react';

const defaultOptions = {
  skin: '#ffdbac',
  shirt: '#8d5524',
  pants: '#2d2d2d',
};

function AvatarCustomizer({ onChange }) {
  const [options, setOptions] = useState(defaultOptions);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newOptions = { ...options, [name]: value };
    setOptions(newOptions);
    onChange(newOptions);
  };

  return (
    <div style={{ margin: '16px 0', padding: 8, background: '#f9f9f9', borderRadius: 8 }}>
      <h3>Customize Your Avatar</h3>
      <label>Skin: <input type="color" name="skin" value={options.skin} onChange={handleChange} /></label>
      <label style={{ marginLeft: 12 }}>Shirt: <input type="color" name="shirt" value={options.shirt} onChange={handleChange} /></label>
      <label style={{ marginLeft: 12 }}>Pants: <input type="color" name="pants" value={options.pants} onChange={handleChange} /></label>
    </div>
  );
}

export default AvatarCustomizer;
