CANVAS_WIDTH = 600;
CANVAS_HEIGHT = 600;

const canvas = document.getElementById( 'mycanvas' );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( CANVAS_WIDTH, CANVAS_HEIGHT ); 
renderer.setClearColor(0x333333);
canvas.appendChild( renderer.domElement );

scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(1, 1, 1, 1000);
camera.position.set(-150, 50, 260);

var controls = new THREE.OrbitControls(camera, renderer.domElement);

var light = new THREE.HemisphereLight( 0xffffff, 0x0fff, 1 );
light.position.set(1, 1, 50);
scene.add( light );


function recreateScene() {
    scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(1, 1, 1, 1000);
    camera.position.set(-150, 50, 260);

    var controls = new THREE.OrbitControls(camera, renderer.domElement);

    var light = new THREE.HemisphereLight( 0xffffff, 0x0fff, 1 );
    light.position.set(1, 1, 50);
    scene.add( light );
}

function loadModel(modelName) {
    const loader = new THREE.GLTFLoader();
    loader.load( 'models/'+ modelName + '/base.gltf', function ( gltf ) {
        scene.add( gltf.scene );
    }, undefined, function ( error ) {
        console.error( error );
    } );

    // document.ge
    recreateScene();
    render();

}


function render() {
  if (resize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

function resize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}