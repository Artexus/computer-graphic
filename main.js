import * as THREE from "./three/build/three.module.js";
import {OrbitControls} from "./three/examples/jsm/controls/OrbitControls.js";
import {GLTFLoader} from "./three/examples/jsm/loaders/GLTFLoader.js"
let range = 20;

// Perspective Camera
let ratio = window.innerWidth / window.innerHeight;
let cam1 = new THREE.PerspectiveCamera(range, ratio, 1, 1000);
let cam2 = new THREE.PerspectiveCamera(range, ratio, 1, 1000);

let scene = new THREE.Scene();
let renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setClearColor(0xadd8e6);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
cam2.position.set(5,0,5);
cam2.lookAt(0,0,0)
cam1.position.set(0,0,5);
cam1.lookAt(0,0,0);


let textureLoader = new THREE.TextureLoader()
let controls = new OrbitControls(cam1, renderer.domElement);
let loader = new GLTFLoader();
loader.load('./scene.gltf', (e) =>{
    let model = e.scene;
    model.traverse(c=>{
        if(c.isMesh){
            c.castShadow = true;
        }
    })
    scene.add(model)
})
let stoneTexture = textureLoader.load('./stone_texture.jpg') ;
let cylindersGeo = new THREE.CylinderGeometry(1, 0.15,1,17,1);
let cylindersMaterial = new THREE.MeshPhongMaterial({map:stoneTexture});
let stoneBase = new THREE.Mesh(cylindersGeo, cylindersMaterial);
stoneBase.position.y = -1;
scene.add(stoneBase);   

let fontLoader = new THREE.FontLoader();
fontLoader.load('./three/examples/fonts/helvetiker_bold.typeface.json',
(font) =>{
    let textGeo = new THREE.TextGeometry('Helicopter', {font:font, size:0.5, height: 0.5})
    let material = new THREE.MeshNormalMaterial()
    let text = new THREE.Mesh(textGeo, material);
    text.position.y = 1;
    text.position.x = -1.5;
    scene.add(text)
})

let grassTexture = textureLoader.load('./grass_texture.jpg') ;
let circleGeo = new THREE.CircleGeometry(1, 17);
let circleMaterial = new THREE.MeshPhongMaterial({map:grassTexture, side:THREE.DoubleSide});
let grassBase = new THREE.Mesh(circleGeo, circleMaterial);
grassBase.receiveShadow = true;
grassBase.position.y = -0.49;
grassBase.rotation.x = Math.PI/2; 
scene.add(grassBase);


let sunTexture = textureLoader.load('./sun_texture.jpg');
let sphereGeo = new THREE.SphereGeometry(4,32,32,0,6.3,0,3.1);
let sphereMaterial = new THREE.MeshPhongMaterial({map:sunTexture, side:THREE.DoubleSide});
let sphereBase = new THREE.Mesh(sphereGeo, sphereMaterial);
sphereBase.position.x = -45;
sphereBase.position.y = 35; 
sphereBase.position.z = 45; 
scene.add(sphereBase)



let spotlight = new THREE.SpotLight(0xFFFFFF, 1,1000,Math.PI/4,1,2);
spotlight.position.set(0,5,0);
spotlight.castShadow = true;
scene.add(spotlight)

let cubeGeometry = new THREE.BoxGeometry(0.3,0.3,0.3);
let cubeMaterial = new THREE.MeshBasicMaterial({color:0x00FF00});
let cube1 = new THREE.Mesh( cubeGeometry, cubeMaterial)
cube1.position.x = -1;
cube1.name = 'Cube1'
scene.add(cube1)

let ambLight = new THREE.AmbientLight(0x404040);
scene.add(ambLight);
let texture = [
    new THREE.MeshBasicMaterial({map: textureLoader.load('./stormydays_lf.jpg'),side: THREE.DoubleSide}),
    new THREE.MeshBasicMaterial({map: textureLoader.load('./stormydays_rt.jpg'),side: THREE.DoubleSide}),
    new THREE.MeshBasicMaterial({map: textureLoader.load('./stormydays_up.jpg'),side: THREE.DoubleSide}),
    new THREE.MeshBasicMaterial({map: textureLoader.load('./stormydays_dn.jpg'),side: THREE.DoubleSide}),
    new THREE.MeshBasicMaterial({map: textureLoader.load('./stormydays_ft.jpg'),side: THREE.DoubleSide}),
    new THREE.MeshBasicMaterial({map: textureLoader.load('./stormydays_bk.jpg'),side: THREE.DoubleSide})
]

let geometry = new THREE.BoxGeometry(100,100,100);
let cube = new THREE.Mesh( geometry, texture)
scene.add(cube)

let raycast = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let flagCam = true;
let transparent = false; 

function onclick(event) {
    let flag = false;
    mouse.x = (event.clientX/window.innerWidth) * 2 - 1; // normalized
    mouse.y = -(event.clientY/window.innerHeight) * 2 + 1; // normalized
    
    if(flagCam){
        raycast.setFromCamera(mouse, cam1);
    }
    else{
        raycast.setFromCamera(mouse, cam2);
    }
    const intersects = raycast.intersectObjects(scene.children);
    for(let i = 0; i < intersects.length; i++) {
        if(intersects[i].object.name == 'Cube1') {
            flag = true;
            console.log(i)
            transparent = !transparent;
        } 
    }
    if(!flag){
        //CHANGE CAMERA
        flagCam = !flagCam;
    }
}
document.addEventListener("pointerdown", onclick);

function animate() {
    if(transparent){
        stoneBase.material.transparent = true;
        grassBase.material.transparent = true;
    }else{
        stoneBase.material.transparent = false;
        grassBase.material.transparent = false;
    }
    if(flagCam){
        renderer.render(scene, cam1);
    }
    else{
        renderer.render(scene, cam2);
    }
    requestAnimationFrame(animate);
}
animate();
    


document.body.appendChild(renderer.domElement);
