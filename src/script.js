import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { MarchingCubes, Sky } from 'three/examples/jsm/Addons.js'
import ghostVertexShader from './shaders/ghost/vertex.glsl'
import ghostFragmentShader from './shaders/ghost/fragment.glsl'
import { Timer } from 'three/addons/misc/Timer.js'
import { DRACOLoader } from 'three/examples/jsm/Addons.js'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()


const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)


const stabla = new THREE.Group()
scene.add(stabla)

gltfLoader.load(
    'trunk.glb',
    (gltf) =>
    {
        const trunk = gltf.scene
        trunk.scale.set(0.3, 0.3, 0.3)
        trunk.position.x = 0.7
        trunk.position.y = 0.3
        trunk.position.z = 2
        trunk.rotation.y = Math.PI - 0.3
        
        scene.add(trunk)
    }
)

gltfLoader.load(
    'tentgreen.glb',
    (gltf)=>
    {
        const sator = gltf.scene
        const bbox = new THREE.Box3().setFromObject(sator)
        const center = bbox.getCenter(new THREE.Vector3())
        
        sator.position.sub(center)
        
        sator.rotation.y = Math.PI + 0.3
        sator.scale.set(0.5, 0.5, 0.5)
        sator.position.x = 1
        sator.position.y = -0.1
        sator.position.z = -2

        scene.add(sator)
    }
)

    gltfLoader.load(
         'tentblue.glb',
        (gltf)=>
        {
            const sator = gltf.scene
            const bbox = new THREE.Box3().setFromObject(sator);
            const center = bbox.getCenter(new THREE.Vector3());
            
            sator.position.sub(center)
            
            sator.rotation.y = Math.PI -0.3
            
            sator.scale.set(0.5, 0.5, 0.5)
            sator.position.x = -1.4
            sator.position.y = 0
            sator.position.z = -0.6
            
            scene.add(sator)
    }
)
 
gltfLoader.load(
    'tree_noise.glb',
    (gltf)=>
    {
        const tree = gltf.scene

        for(let i = 0; i < 30; i++){
            
            const angle = Math.random() * Math.PI * 2
            const radiusMin = 4.5 + Math.random() * 6

            const x = Math.sin(angle) * radiusMin
            const z = Math.cos(angle) * radiusMin

            const treeInstance = tree.clone()
        
        treeInstance.position.set(x, 0, z)
        
        treeInstance.rotation.set(
            (Math.random() - 0.5) * 0.4,
            (Math.random() - 0.5) * 0.4,
            (Math.random() - 0.5) * 0.4
        );

        treeInstance.scale.set(0.7, 0.7, 0.7)

        stabla.add(treeInstance)

        }
    }
)

//Floor loader
const floorAlphaTexture = textureLoader.load('./floor/alpha.webp')
const floorColorTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.webp')
const floorARMTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.webp')
const floorNormalTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.webp')
const floorDisplacementTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.webp')

floorColorTexture.colorSpace = THREE.SRGBColorSpace


floorColorTexture.repeat.set(8, 8)
floorARMTexture.repeat.set(8, 8)
floorNormalTexture.repeat.set(8, 8)
floorDisplacementTexture.repeat.set(8, 8)

floorColorTexture.wrapS = THREE.RepeatWrapping
floorARMTexture.wrapS = THREE.RepeatWrapping
floorNormalTexture.wrapS = THREE.RepeatWrapping
floorDisplacementTexture.wrapS = THREE.RepeatWrapping

floorColorTexture.wrapT = THREE.RepeatWrapping
floorARMTexture.wrapT = THREE.RepeatWrapping
floorNormalTexture.wrapT = THREE.RepeatWrapping
floorDisplacementTexture.wrapT = THREE.RepeatWrapping


//FLOOR
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20, 100, 100),
    new THREE.MeshStandardMaterial({
        alphaMap: floorAlphaTexture,
        transparent: true,
        map: floorColorTexture,
        aoMap: floorARMTexture,
        roughnessMap: floorARMTexture,
        metalnessMap: floorARMTexture,
        normalMap: floorNormalTexture,
        displacementMap: floorDisplacementTexture,
        displacementScale: 0.3,
        displacementBias: -0.2,
        color: new THREE.Color(0x00ff00) 
    })
)

floor.rotation.x = -Math.PI * 0.5
scene.add(floor)

const debugObject = {}
debugObject.color1 = '#5c5bc8'
debugObject.color2 = '#4b9179' //48973f

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#86cdff', 0.3)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight('#86cdff', 1)
directionalLight.position.set(3, 2, -8)
scene.add(directionalLight)

const pointLight1 = new THREE.PointLight('#FF0000', 4)
pointLight1.position.set(1, 0.5, -2)
scene.add(pointLight1)

const pointLight2 = new THREE.PointLight('#FF0000', 4)
pointLight2.position.set(-1.4, 0.5, -0.6)
scene.add(pointLight2)

//ghost1
const ghost1Geometry = new THREE.PlaneGeometry(2, 2, 512, 512)
const ghost1Material = new THREE.ShaderMaterial({
    vertexShader: ghostVertexShader,
    fragmentShader: ghostFragmentShader,
    uniforms: {
        uMaxElevation: {value: 3.7},
        uRadius: {value: 1.3},
        uTime: {value: 0},
        uColor: {value: new THREE.Color(debugObject.color1)},
        uWindStrength: {value: 0.6},
        uWindSpeed: {value: 4.0},
        uWindFrequency: {value: 0.8}

    },
    transparent: true,
    side: THREE.DoubleSide    
})

const ghost1 = new THREE.Mesh(ghost1Geometry, ghost1Material)
ghost1.scale.set(0.3, 0.3, 0.3)
ghost1.rotation.x += Math.PI / 2 + Math.PI
ghost1.position.y = 2
scene.add(ghost1)


const ghost2Geometry = new THREE.PlaneGeometry(2, 2, 512, 512)
const ghost2Material = new THREE.ShaderMaterial({
    vertexShader: ghostVertexShader,
    fragmentShader: ghostFragmentShader,
    uniforms: {
        uMaxElevation: {value: 3.3},
        uRadius: {value: 1.3},
        uTime: {value: 0},
        uColor: {value: new THREE.Color(debugObject.color2)},
        uWindStrength: {value: 0.4},
        uWindSpeed: {value: 6.0},
        uWindFrequency: {value: 1.6}



    },
    transparent: true,
    side: THREE.DoubleSide    
})

const ghost2 = new THREE.Mesh(ghost2Geometry, ghost2Material)
ghost2.scale.set(0.3, 0.3, 0.3)
ghost2.rotation.x += Math.PI / 2 + Math.PI
ghost2.position.y = 2
scene.add(ghost2)

gui.add(ghost1Material.uniforms.uMaxElevation, 'value').min(0).max(5).step(0.1).name('Max Elevation 1')
gui.add(ghost1Material.uniforms.uRadius, 'value').min(0.5).max(1.5).step(0.1).name('Roundness 1')
gui.add(ghost1Material.uniforms.uWindStrength, 'value').min(0.1).max(3).step(0.1).name('Wind Sterngth 1')
gui.add(ghost1Material.uniforms.uWindSpeed, 'value').min(0.1).max(10).step(0.1).name('Wind Speed 1')
gui.add(ghost1Material.uniforms.uWindFrequency, 'value').min(0.1).max(10).step(0.1).name('Wind Frequency 1')

gui.addColor(debugObject, 'color1').name('Ghost 1 Color').onChange(() => 
{
    ghost1Material.uniforms.uColor.value.set(debugObject.color1)
})

gui.add(ghost2Material.uniforms.uMaxElevation, 'value').min(0).max(5).step(0.1).name('Max Elevation 2')
gui.add(ghost2Material.uniforms.uRadius, 'value').min(0.5).max(1.5).step(0.1).name('Roundness 2')
gui.add(ghost2Material.uniforms.uWindStrength, 'value').min(0.1).max(3).step(0.1).name('Wind Sterngth 2')
gui.add(ghost2Material.uniforms.uWindSpeed, 'value').min(0.1).max(10).step(0.1).name('Wind Speed 2')
gui.add(ghost2Material.uniforms.uWindFrequency, 'value').min(0.1).max(10).step(0.1).name('Wind Frequency 2')


gui.addColor(debugObject, 'color2').name('Ghost 2 Color').onChange(() => 
{
    ghost2Material.uniforms.uColor.value.set(debugObject.color2)
})

//GHOST
const ghost3 = new THREE.PointLight("#008000", 6)
scene.add(  ghost3)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 2.5
camera.position.y = 2
camera.position.z = 3.5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Shadows
 */
//renderer
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

//Cast and receive
directionalLight.castShadow = true
ghost3.castShadow = true


//Mapping
directionalLight.shadow.mapSize.width = 256
directionalLight.shadow.mapSize.height = 256
directionalLight.shadow.camera.top = 8
directionalLight.shadow.camera.right = 8
directionalLight.shadow.camera.bottom = -8
directionalLight.shadow.camera.left = -8
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 20


ghost3.shadow.mapSize.width = 256
ghost3.shadow.mapSize.height = 256
ghost3.shadow.camera.top = 10

/**
 * sky
 */
const sky = new Sky()
sky.scale.set(100, 100, 100)
scene.add(sky)

sky.material.uniforms['turbidity'].value = 10
sky.material.uniforms['rayleigh'].value = 3
sky.material.uniforms['mieCoefficient'].value = 0.1
sky.material.uniforms['mieDirectionalG'].value = 0.95
sky.material.uniforms['sunPosition'].value.set(0.3, -0.038, -0.95)

/**
 * fog
 */
scene.fog = new THREE.FogExp2('#10343f', 0.1)
/**
 * Animate
 */
const timer = new Timer()

const tick = () =>
{
    // Timer
    timer.update()
    const elapsedTime = timer.getElapsed()
    
    ghost1Material.uniforms.uTime.value = elapsedTime

    ghost2Material.uniforms.uTime.value = elapsedTime

    //GHOST
  
    const ghostAngle = elapsedTime * 0.4
    ghost1.position.x = Math.cos(ghostAngle) * 3
    ghost1.position.z = Math.sin(ghostAngle) * 3
    ghost1.position.y =0.5* Math.sin(ghostAngle) * Math.sin(ghostAngle * 2.34) * Math.sin(ghostAngle * 3.45) +1
   
    const ghost2Angle = -elapsedTime * 0.38
    ghost2.position.x = Math.cos(ghost2Angle) * 4
    ghost2.position.z = Math.sin(ghost2Angle) * 4
    ghost2.position.y =0.7* Math.sin(ghost2Angle) * Math.sin(ghost2Angle * 2.34) * Math.sin(ghost2Angle * 3.45) + 0.4
   
    const ghost3Angle = elapsedTime * 0.2
    ghost3.position.x = Math.cos(ghost3Angle) * 5
    ghost3.position.z = Math.sin(ghost3Angle) * 5
    ghost3.position.y = Math.sin(ghost3Angle) * Math.sin(ghost3Angle * 2.34) * Math.sin(ghost3Angle * 3.45)
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()