import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function CityLoader() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    const aspect = container.clientWidth / container.clientHeight;
    // Massive orthographic view for architectural scanning feel
    const d = 15;
    const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    // Deep Isometric angle
    camera.position.set(30, 40, 30);
    camera.lookAt(0, 0, 0);
    
    // Transparent rendering to blend into the React UI flawlessly
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    
    // The Core Box Geometry representing parametric data structures
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    geometry.translate(0, 0.5, 0);
    
    // Dark glass / Cyberpunk architectural material matching #131316 background
    const material = new THREE.MeshPhysicalMaterial({ 
       color: 0x131316,       
       emissive: 0x3b4a6b,    
       emissiveIntensity: 0.1, 
       metalness: 0.9, 
       roughness: 0.2,
       transparent: true,
       opacity: 0.9
    });
    
    // A sprawling computational grid
    const grid = 18;
    const count = grid * grid;
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(mesh);
    
    // Dramatic Architectural Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0x4f46e5, 4.0);
    dirLight.position.set(-15, 30, 15);
    scene.add(dirLight);
    
    const dirLight2 = new THREE.DirectionalLight(0x10b981, 1.5); // Subtle emerald sweep from the back
    dirLight2.position.set(20, -10, -20);
    scene.add(dirLight2);

    let time = 0;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    
    // Base vs Peak colors for instance wave coloring
    const baseColor = new THREE.Color('#131316');
    const peakColor = new THREE.Color('#4f46e5');
    
    let animationFrameId;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.05; // Scan speed
      let i = 0;
      const offset = (grid - 1) / 2;
      for (let x = 0; x < grid; x++) {
        for (let z = 0; z < grid; z++) {
          const posX = (x - offset) * 1.5;
          const posZ = (z - offset) * 1.5;
          
          // Complex sweeping scanline wave math
          const dist = Math.sqrt(posX * posX + posZ * posZ);
          const wave = Math.sin(time - dist * 0.3) * Math.cos(time * 0.5 + posX * 0.1);
          const normWave = Math.max(0, wave); // Only allow upward structural spikes
          
          // Baseline height is heavily flattened, jumps violently when "scanned"
          const h = 0.1 + Math.pow(normWave, 2) * 8.0; 
          
          dummy.position.set(posX, 0, posZ);
          dummy.scale.set(0.85, h, 0.85); // Sharp, detached pillars
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
          
          // Emissive hue dynamically sweeps across the grid exactly matching the height map
          color.lerpColors(baseColor, peakColor, Math.pow(normWave, 3));
          mesh.setColorAt(i, color);
          i++;
        }
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      renderer.render(scene, camera);
    }
    
    animate();

    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      const newAspect = width / height;
      camera.left = -d * newAspect;
      camera.right = d * newAspect;
      camera.top = d;
      camera.bottom = -d;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="flex-grow flex flex-col items-center justify-center animate-fade-in relative w-full h-full min-h-[450px]">
       {/* Transparent 3D Canvas completely fills the background without boundaries */}
       <div 
         ref={mountRef} 
         className="absolute inset-x-0 inset-y-[-100px] z-0 pointer-events-none opacity-90 scale-110"
       />
       
       {/* UI Text Lockup floated gracefully above the 3D void */}
       <div className="relative z-10 flex flex-col items-center gap-4 bg-[#131316]/70 backdrop-blur-lg border border-indigo-500/40 px-10 py-6 rounded-2xl shadow-[0_0_40px_rgba(79,70,229,0.15)] mt-[10%]">
          <div className="flex items-center gap-4">
             <div className="relative w-3.5 h-3.5">
                <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-80 duration-1000"></span>
                <span className="absolute inset-0 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]"></span>
             </div>
             <span className="font-mono text-[11px] tracking-[0.2em] text-indigo-100 uppercase font-semibold drop-shadow-md">
                Synthesizing Neural Dimensions...
             </span>
          </div>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent"></div>
          <p className="font-mono text-[9px] text-[#A1A1AA] tracking-widest uppercase text-center max-w-[240px]">
             Generating geographic structural models across spatial coordinates
          </p>
       </div>
    </div>
  );
}
