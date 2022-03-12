var container, camera, scene, renderer, mesh,

mouse = { x: 0, y: 0 },
objects = [],

count = 0,

CANVAS_WIDTH = 1000,
CANVAS_HEIGHT = 1000;

canvas = document.getElementById( 'mycanvas' );
renderer = new THREE.WebGLRenderer();
renderer.setSize( CANVAS_WIDTH, CANVAS_HEIGHT );      
canvas.appendChild( renderer.domElement );

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera( 50, CANVAS_WIDTH / CANVAS_HEIGHT, 1, 0 );
camera.position.y = 0;
camera.position.z = 0;
camera.lookAt( scene.position );

const loader = new THREE.GLTFLoader();

loader.load( 'models/white_ape/base.gltf', function ( gltf ) {

	scene.add( gltf.scene );

}, undefined, function ( error ) {

	console.error( error );

} );
// objects.push( mesh );

                    
// find intersections
var vector = new THREE.Vector3();
var raycaster = new THREE.Raycaster();


function render() {

    // mesh.rotation.y += 0.01;
    
    renderer.render( scene, camera );

}

(function animate() {

    requestAnimationFrame( animate );

    render();

})();
