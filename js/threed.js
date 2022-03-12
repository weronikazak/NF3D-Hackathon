var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(75/*POV*/, window.innerWidth / window.innerHeight/*aspect ratio so it takes on the size of the screen*/, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();//API for rendering/processing 2D and 3D to browsers
renderer.setSize(window.innerWidth, innerHeight);//size you want it to render which is size of screen/area
document.body.appendChild(renderer.domElement);//Add the renderer to the HTML document/canvas

controls = new THREE.OrbitControls(camera, renderer.domElement);
//-------create shape you need geometry, material/apperance and cube

var loader = new THREE.GLTFLoader();

loader.load(
    // resource URL
    'models/gltf/monke/monke.gltf',
    // called when the resource is loaded
    function ( gltf ) {

        scene.add( gltf.scene );
        camera.position.z = 5;
        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Scene
        gltf.scenes; // Array<THREE.Scene>
        gltf.cameras; // Array<THREE.Camera>
        gltf.asset; // Object

    },
    // called when loading is in progresses
    function ( xhr ) {

        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

    },
    // called when loading has errors
    function ( error ) {

        console.log( 'An error happened' );

    }
);


var animate = function(){

    requestAnimationFrame(animate);
    //cube.rotation.x +=0.01;
    //cube.rotation.y +=0.01;
    renderer.render(scene, camera);
}



animate();