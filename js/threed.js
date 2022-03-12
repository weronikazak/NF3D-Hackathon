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
    "Gray": 0x898889
}

function loadModel(collection, attributes) {
    var fur_colour = attributes["Fur"];
    var newMaterial = new THREE.MeshStandardMaterial({color: COLOR_HEX[fur_colour]});

    for (key in attributes) {
        if (key == "Background") continue;
    
        const loader = new THREE.GLTFLoader();
    
            
        if (key == "Fur") {
            loader.load( 'models/'+ collection + "/Body/model.gltf", function ( gltf ) {
                gltf.scene.children[0].children[0].material = newMaterial;
                gltf.scene.children[0].children[2].material = newMaterial;

                scene.add( gltf.scene );
            }, undefined, function ( error ) {
                console.error( error );
            } );
        } else if (key == "Mouth") {
            loader.load( 'models/'+ collection + "/" + key + "/" + attributes[key] +"/model.gltf", function ( gltf ) {
            gltf.scene.children[0].children[2].material = newMaterial;

            scene.add( gltf.scene );
            }, undefined, function ( error ) {
                console.error( error );
            } );
        } else {

            loader.load( 'models/'+ collection + "/" + key + "/" + attributes[key] +'/model.gltf', function ( gltf ) {
            scene.add( gltf.scene );

            }, undefined, function ( error ) {
                console.error( error );
            } );
        }
     };
    // for (var i = 0; i < attributes.length; i++) {
    //     var attr = attributes[i];
    //     if (attr[0] == "Background") continue;

    //     const loader = new THREE.GLTFLoader();

    //     var fur_colour;
        
    //     if (attr[0] == "Fur") {
    //         fur_colour = attr[1];

    //         loader.load( 'models/'+ collection + "/Body/model.gltf", function ( gltf ) {
    //             var newMaterial = new THREE.MeshStandardMaterial({color: COLOR_HEX[fur_colour]});
    //             gltf.scene.children[0].children[0].material = newMaterial;
    //             gltf.scene.children[0].children[2].material = newMaterial;


    //             scene.add( gltf.scene );
    //         }, undefined, function ( error ) {
    //             console.error( error );
    //         } );
    //     } else if (attr[0] == "Mouth") {
    //         loader.load( 'models/'+ collection + "/Body/model.gltf", function ( gltf ) {
    //             var newMaterial = new THREE.MeshStandardMaterial({color: COLOR_HEX[fur_colour]});
    //             gltf.scene.children[0].children[0].material = newMaterial;
    //             gltf.scene.children[0].children[2].material = newMaterial;


    //             scene.add( gltf.scene );
    //         }, undefined, function ( error ) {
    //             console.error( error );
    //         } );
    //     } else {

    //         loader.load( 'models/'+ collection + "/" + attr[0] + "/" + attr[1] +'/model.gltf', function ( gltf ) {

                

    //             scene.add( gltf.scene );

    //         }, undefined, function ( error ) {
    //             console.error( error );
    //         } );
    //     }
        
    // }

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