import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    /* ── renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    /* ── scene / camera ── */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 200);
    camera.position.set(0, 0, 30);

    /* ── ambient + directional light ── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dirLight = new THREE.DirectionalLight(0xa78bfa, 2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);
    const dirLight2 = new THREE.DirectionalLight(0x60a5fa, 1.5);
    dirLight2.position.set(-10, -10, 5);
    scene.add(dirLight2);

    /* ── floating wireframe shapes ── */
    const shapes: THREE.Mesh[] = [];
    const geometries = [
      new THREE.IcosahedronGeometry(1.6, 0),
      new THREE.OctahedronGeometry(1.4, 0),
      new THREE.TorusGeometry(1.1, 0.35, 8, 14),
      new THREE.TetrahedronGeometry(1.6, 0),
      new THREE.IcosahedronGeometry(1.2, 0),
      new THREE.OctahedronGeometry(1.0, 0),
      new THREE.TorusGeometry(0.8, 0.25, 7, 12),
      new THREE.TetrahedronGeometry(1.2, 0),
    ];

    const colors = [0x7c3aed, 0x3b82f6, 0x8b5cf6, 0x2563eb, 0xa78bfa, 0x60a5fa];

    geometries.forEach((geo, i) => {
      const color: THREE.ColorRepresentation = colors[i % colors.length] ?? 0x7c3aed;
      const mat = new THREE.MeshPhongMaterial({
        color,
        wireframe: true,
        opacity: 0.18 + Math.random() * 0.12,
        transparent: true,
      });
      const mesh = new THREE.Mesh(geo, mat);

      // spread them in a wide ring
      const angle = (i / geometries.length) * Math.PI * 2;
      const radius = 14 + Math.random() * 8;
      mesh.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 8 - 4
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      const s = 0.7 + Math.random() * 0.8;
      mesh.scale.setScalar(s);

      // attach random drift speeds
      type AnimMesh = THREE.Mesh & { _spin: THREE.Vector3; _drift: THREE.Vector3 };
      const am = mesh as unknown as AnimMesh;
      am._spin = new THREE.Vector3(
        (Math.random() - 0.5) * 0.004,
        (Math.random() - 0.5) * 0.004,
        (Math.random() - 0.5) * 0.003
      );
      am._drift = new THREE.Vector3(
        (Math.random() - 0.5) * 0.004,
        (Math.random() - 0.5) * 0.003,
        0
      );

      scene.add(mesh);
      shapes.push(mesh);
    });

    /* ── particle field ── */
    const particleCount = 600;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 10;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x7c3aed,
      size: 0.12,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    /* ── mouse parallax ── */
    let mouseX = 0;
    let mouseY = 0;
    const handleMouse = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouse);

    /* ── resize ── */
    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    /* ── animation loop ── */
    let frame = 0;
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      frame += 0.005;

      // camera gentle sway following mouse
      camera.position.x += (mouseX * 3 - camera.position.x) * 0.03;
      camera.position.y += (mouseY * 2 - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      // rotate shapes + drift
      shapes.forEach((mesh) => {
        type AnimMesh = THREE.Mesh & { _spin: THREE.Vector3; _drift: THREE.Vector3 };
        const m = mesh as unknown as AnimMesh;
        mesh.rotation.x += m._spin.x;
        mesh.rotation.y += m._spin.y;
        mesh.rotation.z += m._spin.z;
        mesh.position.x += m._drift.x;
        mesh.position.y += m._drift.y;

        // gentle bob
        mesh.position.y += Math.sin(frame + mesh.position.x) * 0.003;

        // wrap-around
        if (mesh.position.x > 28) mesh.position.x = -28;
        if (mesh.position.x < -28) mesh.position.x = 28;
        if (mesh.position.y > 20) mesh.position.y = -20;
        if (mesh.position.y < -20) mesh.position.y = 20;
      });

      // slowly rotate particle cloud
      particles.rotation.y = frame * 0.05;
      particles.rotation.x = frame * 0.02;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
