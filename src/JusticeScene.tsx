import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { sceneMotion } from './motion'

const gold = new THREE.MeshStandardMaterial({ color: '#bda16b', metalness: 0.92, roughness: 0.24 })
const brightGold = new THREE.MeshStandardMaterial({ color: '#d2b77e', metalness: 0.95, roughness: 0.19 })
const agedGold = new THREE.MeshStandardMaterial({ color: '#736044', metalness: 0.86, roughness: 0.31 })
const chainGeometry = new THREE.TorusGeometry(0.029, 0.008, 5, 10)

function Turned({ points, material = gold, ...props }: { points: number[][]; material?: THREE.Material; position?: [number, number, number]; scale?: number }) {
  const geometry = useMemo(() => new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), 64), [points])
  useEffect(() => () => geometry.dispose(), [geometry])
  return <mesh geometry={geometry} material={material} {...props} />
}

const pillarProfile = [[0, 0.48], [.48, .48], [.48, .56], [.41, .59], [.4, .68], [.32, .73], [.3, .84], [.22, .92], [.2, 1.08], [.23, 1.13], [.23, 1.2], [.17, 1.26], [.13, 1.48], [.12, 3.58], [.18, 3.65], [.19, 3.72], [.24, 3.76], [.24, 3.84], [.18, 3.89], [.17, 4.19], [.23, 4.23], [.23, 4.31], [.14, 4.38], [.1, 4.55], [.04, 4.7], [0, 4.79]]
const bowlProfile = [[0, -.19], [.12, -.18], [.26, -.145], [.41, -.085], [.56, .02], [.67, .15], [.71, .22], [.72, .26], [.7, .29], [.67, .27], [.65, .21], [.55, .075], [.4, -.03], [.25, -.09], [.1, -.12], [0, -.13]]

function Chain({ end }: { end: [number, number, number] }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const count = 34
  useEffect(() => {
    if (!ref.current) return
    const endpoint = new THREE.Vector3(...end)
    const direction = endpoint.clone().normalize()
    const orientation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
    const dummy = new THREE.Object3D()
    for (let i = 0; i < count; i++) {
      dummy.position.copy(endpoint).multiplyScalar((i + 0.5) / count)
      dummy.quaternion.copy(orientation)
      dummy.rotateY(i % 2 ? Math.PI / 2 : 0)
      dummy.scale.set(0.8, 1.3, 0.8)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [end])
  return <instancedMesh ref={ref} args={[chainGeometry, brightGold, count]} />
}

function Suspension({ side, beam, reduced }: { side: number; beam: React.RefObject<THREE.Group | null>; reduced: boolean }) {
  const ref = useRef<THREE.Group>(null)
  const ends = useMemo(() => [0, 2 * Math.PI / 3, 4 * Math.PI / 3].map(angle => [Math.cos(angle) * .66, -1.62, Math.sin(angle) * .66] as [number, number, number]), [])
  useFrame(({ clock }, delta) => {
    if (!ref.current || !beam.current) return
    ref.current.rotation.z = THREE.MathUtils.damp(ref.current.rotation.z, -beam.current.rotation.z + (reduced ? 0 : Math.sin(clock.elapsedTime * .9 + side) * .012), 4, delta)
  })
  return <group ref={ref} position={[side * 1.92, .07, 0]}>
    <mesh material={brightGold}><torusGeometry args={[.075, .018, 8, 24]} /></mesh>
    {ends.map((end, i) => <Chain end={end} key={i} />)}
    <group position={[0, -1.88, 0]}><Turned points={bowlProfile} material={brightGold} /><mesh rotation={[Math.PI / 2, 0, 0]} position={[0, .265, 0]} material={gold}><torusGeometry args={[.702, .025, 10, 64]} /></mesh><mesh position={[0, -.205, 0]} material={agedGold}><sphereGeometry args={[.08, 16, 12]} /></mesh></group>
  </group>
}

function Beam({ beam, reduced }: { beam: React.RefObject<THREE.Group | null>; reduced: boolean }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-2.03, .04)
    s.bezierCurveTo(-1.55, .05, -.78, .31, -.24, .19)
    s.quadraticCurveTo(0, .09, .24, .19)
    s.bezierCurveTo(.78, .31, 1.55, .05, 2.03, .04)
    s.lineTo(2.03, -.07)
    s.bezierCurveTo(1.3, -.08, .65, .03, .2, -.04)
    s.quadraticCurveTo(0, -.16, -.2, -.04)
    s.bezierCurveTo(-.65, .03, -1.3, -.08, -2.03, -.07)
    s.closePath()
    return s
  }, [])
  return <group ref={beam} position={[0, 4.19, 0]}>
    <mesh material={gold} position={[0, 0, -.065]}><extrudeGeometry args={[shape, { depth: .13, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .028, bevelThickness: .025, curveSegments: 24 }]} /></mesh>
    {[-1, 1].map(side => <group key={side}><mesh position={[side * 2.01, .055, 0]} material={brightGold}><sphereGeometry args={[.09, 20, 16]} /></mesh><Suspension side={side} beam={beam} reduced={reduced} /></group>)}
    <mesh rotation={[Math.PI / 2, 0, 0]} material={brightGold}><cylinderGeometry args={[.15, .15, .26, 32]} /></mesh>
    <mesh position={[0, 0, .155]} material={agedGold}><sphereGeometry args={[.087, 24, 16]} /></mesh>
  </group>
}

function Stone() {
  return <group>
    <mesh position={[0, .02, 0]}><cylinderGeometry args={[.96, 1.09, .62, 64]} /><meshPhysicalMaterial color="#242622" roughness={.31} metalness={.16} clearcoat={.28} onBeforeCompile={shader => {
      shader.vertexShader = 'varying vec3 vStonePosition;\n' + shader.vertexShader
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvStonePosition = position;')
      shader.fragmentShader = 'varying vec3 vStonePosition;\n' + shader.fragmentShader
      shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        vec3 p = vStonePosition;
        float wave = p.y * 17.0 + p.x * 8.0 + p.z * 4.0 + sin(p.x * 6.0 + p.y * 3.0) * 2.0 + sin(p.z * 13.0 + p.y * 8.0) * 0.7;
        float vein = pow(0.5 + 0.5 * sin(wave), 28.0);
        float fine = pow(0.5 + 0.5 * sin(wave * 2.13 + 3.0), 45.0);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.26, 0.265, 0.23), vein * 0.4 + fine * 0.12);
      `)
    }} /></mesh>
    <mesh position={[0, -.325, 0]} material={agedGold}><cylinderGeometry args={[1.09, 1.09, .055, 64]} /></mesh>
    <mesh position={[0, .355, 0]} material={agedGold}><cylinderGeometry args={[.97, .97, .055, 64]} /></mesh>
    <mesh position={[0, .415, 0]} material={gold}><cylinderGeometry args={[.64, .78, .08, 64]} /></mesh>
    <mesh position={[0, -.41, 0]}><cylinderGeometry args={[1.16, 1.19, .12, 64]} /><meshStandardMaterial color="#11140f" metalness={.3} roughness={.3} /></mesh>
  </group>
}

function Sculpture({ variant, reduced, pointer }: { variant: 'hero' | 'feature'; reduced: boolean; pointer: React.RefObject<{ x: number; y: number }> }) {
  const root = useRef<THREE.Group>(null)
  const beam = useRef<THREE.Group>(null)
  useFrame(({ clock, camera }, delta) => {
    if (!root.current || !beam.current) return
    const dt = Math.min(delta, .05)
    const t = clock.elapsedTime
    const p = reduced ? { x: 0, y: 0 } : pointer.current
    const progress = variant === 'hero' ? sceneMotion.hero : sceneMotion.feature
    const intro = reduced ? 1 : sceneMotion.entrance
    const yaw = variant === 'hero' ? -.24 + progress * .5 : -.7 + progress * 1.2
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, yaw + p.x * .21 + (1 - intro) * .7, 3, dt)
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, p.y * .045, 3, dt)
    root.current.position.y = -2.13 + (reduced ? 0 : Math.sin(t * .55) * .025) - (variant === 'hero' ? progress * .22 : 0) - (1 - intro) * .35
    root.current.scale.setScalar(.94 + intro * .06)
    beam.current.rotation.z = THREE.MathUtils.damp(beam.current.rotation.z, p.x * .065 + (reduced ? 0 : Math.sin(t * .7) * .018), 2.5, dt)
    if (variant === 'feature') camera.position.z = 12.6 - progress * 2.1
    else camera.position.z = window.innerWidth > 600 && window.innerWidth <= 800 ? 16 : 12.6
    camera.lookAt(0, .05, 0)
  })
  return <group ref={root} position={[0, -2.13, 0]}><Stone /><Turned points={pillarProfile} />
    {Array.from({ length: 12 }, (_, i) => { const angle = i * Math.PI / 6; return <mesh key={i} position={[Math.cos(angle) * .128, 2.43, Math.sin(angle) * .128]} material={i % 2 ? agedGold : brightGold}><cylinderGeometry args={[.014, .021, 2.19, 8]} /></mesh> })}
    {[1.32, 3.53].map(y => <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={brightGold}><torusGeometry args={[.145, .025, 10, 32]} /></mesh>)}
    <Beam beam={beam} reduced={reduced} />
    <mesh position={[0, 4.66, 0]} material={brightGold}><sphereGeometry args={[.085, 24, 16]} /></mesh>
  </group>
}

export default function JusticeScene({ variant, active, reduced }: { variant: 'hero' | 'feature'; active: boolean; reduced: boolean }) {
  const pointer = useRef({ x: 0, y: 0 })
  const [lost, setLost] = useState(false)
  useEffect(() => {
    if (reduced) return
    const move = (event: PointerEvent) => { pointer.current = { x: event.clientX / window.innerWidth * 2 - 1, y: event.clientY / window.innerHeight * 2 - 1 } }
    const reset = () => { pointer.current = { x: 0, y: 0 } }
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', reset)
    return () => { window.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', reset) }
  }, [reduced])
  if (lost) return <div className="scene-placeholder"><span>التوازن أساس كل قرار.</span><small>توقّف العرض ثلاثي الأبعاد. أعد تحميل الصفحة للمحاولة مجددًا.</small></div>
  return <Canvas dpr={[1, 1.6]} frameloop={active ? (reduced ? 'demand' : 'always') : 'never'} camera={{ position: [4.5, 2.5, 12.6], fov: 33, near: .1, far: 60 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} onCreated={({ gl, camera }) => { camera.lookAt(0, .05, 0); gl.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); setLost(true) }, { once: true }) }}>
    <ambientLight intensity={.3} />
    <spotLight position={[-4, 7, 5]} intensity={90} angle={.5} penumbra={1} color="#fff0d5" />
    <spotLight position={[4, 4, -3]} intensity={65} angle={.6} penumbra={1} color="#d9c4a2" />
    <Environment resolution={128} frames={1}><mesh><sphereGeometry args={[20, 24, 16]} /><meshBasicMaterial color="#6d685f" side={THREE.BackSide} /></mesh><Lightformer form="rect" intensity={3.5} position={[-4, 3, 4]} scale={[3, 7, 1]} rotation={[0, Math.PI / 4, 0]} /><Lightformer form="rect" intensity={4} position={[3, 4, 2]} scale={[2, 6, 1]} rotation={[0, -Math.PI / 4, 0]} /><Lightformer form="rect" intensity={2} position={[0, 5, -3]} scale={[5, 3, 1]} rotation={[Math.PI / 4, 0, 0]} /><Lightformer form="rect" intensity={.8} color="#d5af6b" position={[-3, 0, -4]} scale={[3, 5, 1]} /></Environment>
    <Sculpture variant={variant} reduced={reduced} pointer={pointer} />
    <ContactShadows position={[0, -2.64, 0]} opacity={.5} scale={9} blur={2.8} far={5} resolution={256} frames={1} color="#000000" />
  </Canvas>
}
