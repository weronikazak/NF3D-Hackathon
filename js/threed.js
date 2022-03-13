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

const COLOR_HEX = {
    "Black": 0x333333,
    "Pink": 0xF5979E,
    "Cream": 0xF7F5C9,
    "Gray": 0x898889,
    "Robot": 0xfff, // TODO add texture
    "Cheetah": 0xfff, // TODO add texture
    "Golden Brown": 0xB07811,
    "Brown": 0x796241,
    "Zombie": 0xfff,  // TODO add texture
    "Dmit": 0xfff,  // TODO add texture
    "Dark Brown": 0x674327,
    "Tan": 0xC4B29D,
    "Trippy": 0xfff,  // TODO add texture
    "Red": 0xA30612,
    "Death Bot": 0xfff,  // TODO add texture
    "Blue": 0x06529C,
    "Solid Gold": 0xfff,  // TODO add texture
    "White": 0xF7EEE9,
    "Noise": 0xfff  // TODO add texture
}

function showError(key, attr) {
    document.getElementById("resultSpace").innerHTML =  
    `<div class="alert alert-danger mt-2" role="alert"> Model for features ${key}: ${attr} don't exist yet!</div>`;
}

function modelExists(path) {
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', path, false);
    xhr.send();
     
    if (xhr.status == "404") {
        return false;
    } else {
        return true;
    }
}

function loadModel(collection, attributes) {
    var fur_colour = attributes["Fur"];
    var newMaterial = new THREE.MeshStandardMaterial({color: COLOR_HEX[fur_colour]});

    for (key in attributes) {
        if (key == "Background") continue;
    
        const loader = new THREE.GLTFLoader();
        var path = "";
            
        if (key == "Fur") {
            path = 'models/'+ collection + "/Body/model.gltf";

            loader.load( path, function ( gltf ) {
                gltf.scene.children[0].children[0].material = newMaterial;
                gltf.scene.children[0].children[2].material = newMaterial;

                scene.add( gltf.scene );
            }, undefined, function ( error ) {
                console.error( error );
            } );
        } else if (key == "Mouth") {
            path = 'models/'+ collection + "/" + key + "/" + attributes[key] +"/model.gltf";
            
            if (!modelExists(path)) {
                showError(key, attributes[key]);
                break;
            } 

            loader.load( path, function ( gltf ) {
            gltf.scene.children[0].children[2].material = newMaterial;

            scene.add( gltf.scene );
            }, undefined, function ( error ) {
                console.error( error );
            } );
        } else {
            path = 'models/'+ collection + "/" + key + "/" + attributes[key] +'/model.gltf';

            if (!modelExists(path)) {
                showError(key, attributes[key]);
                break;
            } 

            loader.load( path, function ( gltf ) {
                scene.add( gltf.scene );
            }, undefined, function ( error ) {
                console.error( error );
            } );
        }
     };

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