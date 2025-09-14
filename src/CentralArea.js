import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

function CentralArea({ avatarOptions = { skin: '#ffdbac', shirt: '#8d5524', pants: '#2d2d2d' }, onMove }) {
  const mountRef = useRef();
  const positionRef = useRef({ x: 0, y: 0 });


  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xaee7ff);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Responsive resize
    const handleResize = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Central area (ground)
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(10, 32),
      new THREE.MeshPhongMaterial({ color: 0x6ad16a })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Simple avatar (cylinder body, sphere head, pants)
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.7, 32),
      new THREE.MeshPhongMaterial({ color: avatarOptions.shirt })
    );
    body.position.y = 0.85;
    scene.add(body);
    const pants = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.5, 32),
      new THREE.MeshPhongMaterial({ color: avatarOptions.pants })
    );
    pants.position.y = 0.35;
    scene.add(pants);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 32, 32),
      new THREE.MeshPhongMaterial({ color: avatarOptions.skin })
    );
    head.position.y = 1.4;
    scene.add(head);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(5, 10, 7);
    scene.add(dir);

    // Avatar movement
    let avatarX = 0;
    let avatarZ = 0;
    const moveSpeed = 0.1;
    function moveAvatar(dx, dz) {
      avatarX += dx;
      avatarZ += dz;
      body.position.x = avatarX;
      pants.position.x = avatarX;
      head.position.x = avatarX;
      body.position.z = avatarZ;
      pants.position.z = avatarZ;
      head.position.z = avatarZ;
      positionRef.current = { x: avatarX, z: avatarZ };
      if (onMove) onMove({ x: avatarX, z: avatarZ });
    }
    function handleKey(e) {
      if (e.repeat) return;
      if (e.key === 'ArrowUp' || e.key === 'w') moveAvatar(0, -moveSpeed);
      if (e.key === 'ArrowDown' || e.key === 's') moveAvatar(0, moveSpeed);
      if (e.key === 'ArrowLeft' || e.key === 'a') moveAvatar(-moveSpeed, 0);
      if (e.key === 'ArrowRight' || e.key === 'd') moveAvatar(moveSpeed, 0);
    }
    window.addEventListener('keydown', handleKey);

    // Animation loop
    const animate = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKey);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [avatarOptions, onMove]);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '60vh', maxWidth: 900, margin: '0 auto', touchAction: 'none' }}
    />
  );
}

export default CentralArea;
