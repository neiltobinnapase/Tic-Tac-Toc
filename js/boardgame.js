var renderer;
var camera;
var spotlight;
var scene;

var mouse = new THREE.Vector2();
var selectedobject = null;

var raycaster = new THREE.Raycaster();

var place, enemy;
var victory, lose;
var TakeOnMe;
function loadSounds()
{
    place = new Audio("sounds/place.mp3");
    place.volume = .7;
    enemy = new Audio("sounds/enemy.mp3");
    enemy.volume = .7;

    victory = new Audio("sounds/victory.mp3");
    victory.volume =.5;
    lose = new Audio("sounds/lose.mp3");
    lose.volume = .5;

    TakeOnMe = new Audio("sounds/Take On Me.mp3");
    TakeOnMe.volume = .2;
    TakeOnMe.loop = true;
    TakeOnMe.play();
}

function init() {
    scene = new THREE.Scene();

    addRenderer();
    addCamera();
    addSpotlight();

    //Loads sounds used for game and bg music
    loadSounds();
    
    //Creates all objects placed in the scene. Includes external 3D models
    addBoardPlane();
    addPlane();
    addGround();
    addTable();
    addWoodenStuffs();
    addTanks();
    addRings();

    document.body.appendChild(renderer.domElement);

    //Registers mouse movement and click functionality
    renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
    renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
    renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);

    //Allows for window resize; scene will scale when window size changes
	window.addEventListener('resize', onResize, false);

    render();
}

function render() {
    //Animates robots sitting on the table
    maintainTankMovement();

    //Handles reset of game objects when key is pressed
    reset();
    //Handles music toggling when key is pressed
    checkMusic();

    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

//When key is pressed, remove all existing pieces on board, reset boardStates array for game logic, and remove existing 3D text
function reset()
{
    if(Key.isDown(Key.R)){
        for(var p = 0; p < Pieces.length; p++){
            scene.remove(Pieces[p]);
        }
    
        Pieces = [];
        boardStates = [[STATES.n, 0], [STATES.n, 1], [STATES.n, 2], [STATES.n, 3], [STATES.n, 4], [STATES.n, 5], [STATES.n, 6], [STATES.n, 7], [STATES.n, 8]];
    
        for(var t = 0; t < texts.length; t++){
            scene.remove(texts[t]);
        }

        texts = [];
    }
}

//When music is playing, pause it. When not playing, resume playing.
var musicplaying = true;
function checkMusic()
{
    if(Key.isDown(Key.M)){
        if(musicplaying){
            TakeOnMe.pause();
            musicplaying = false;
        }
        else{
            TakeOnMe.play();
            musicplaying = true;
        }

    }
}

function addRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
}

function addCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, -1.75, 4);
    camera.up = new THREE.Vector3(0, 0, 1);
    camera.lookAt(scene.position);
}

function addSpotlight() {
    spotlight = new THREE.SpotLight(0xffffff, 1.75);
    spotlight.position.set(0, 30, 500);
    spotlight.angle = 1.05;
    spotlight.distance = 1000;
    spotlight.penumbra = 0;
    spotlight.decay = 0.5;
    spotlight.shadow.camera.visible = true;
    spotlight.shadow.camera.near = 10;
    spotlight.shadow.camera.far = 1000;
    spotlight.shadow.mapSize.width = 1024;
    spotlight.shadow.mapSize.height = 1024;
    spotlight.shadow.camera.right = 10;
    spotlight.shadow.camera.left = -10;
    spotlight.shadow.camera.top = 5;
    spotlight.shadow.camera.bottom = -5;

    spotlight.castShadow = true;
    scene.add(spotlight);

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
}

//Allows for window resize scaling
function onResize() 
{
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

//Textured plane placed on top of table object
var boardPlane;
var boardWidth = 3, boardLength = 2.75;
function addBoardPlane() {
    var loader = new THREE.TextureLoader();
    loader.load('images/tablecloth.jpg', function (texture) {

        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(4, 4);

        var planeGeometry = new THREE.PlaneGeometry(boardWidth, boardLength);
        var planeMaterial = new THREE.MeshLambertMaterial({ map: texture });

        boardPlane = new THREE.Mesh(planeGeometry, planeMaterial);

        boardPlane.receiveShadow = true;
        boardPlane.position.set(0, 0, 0);

        scene.add(boardPlane);
    });
}

//Invisible plane used for raycasting
var plane;
function addPlane() {
    var planeGeometry = new THREE.PlaneGeometry(boardWidth, boardLength);
    var planeMaterial = new THREE.MeshBasicMaterial({ transparent: true, color: 0x0000ff, opacity: 0.0 });

    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.set(0, 0, 0);
    plane.name = "plane";

    scene.add(plane);
}

//Textured ground plane placed below all objects
function addGround() {
    var loader = new THREE.TextureLoader();
    loader.load('images/grass.jpg', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(16, 16);

        var planeGeometry = new THREE.PlaneGeometry(30, 30);
        var planeMaterial = new THREE.MeshLambertMaterial({ map: texture });

        var groundPlane = new THREE.Mesh(planeGeometry, planeMaterial);

        groundPlane.receiveShadow = true;
        groundPlane.position.set(0, 0, -4);

        scene.add(groundPlane);
    });
}

//External 3D model of table. Placed underneath game board and other objects
function addTable() {
    (new THREE.ObjectLoader()).load('models/wooden-coffe-table.json', function (obj) {
        obj.scale.set(2.45, 2.45, 1.5);
        obj.receiveShadow = true;
        obj.castShadow = true;

        obj.rotation.x = (Math.PI / 2);
        obj.rotation.y = (Math.PI);
        obj.position.set(0, 0, -3.25);
        scene.add(obj);
    });
}

//Squares used in game, placed in a 3x3 grid
var Blocks = [];
function addWoodenStuffs() {
    (new THREE.TextureLoader()).load('images/wood.png', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(8, 8);

        var BlockGeometry = new THREE.BoxGeometry(.94, .83, .15);
        var BlockMaterial = new THREE.MeshLambertMaterial({ map: texture });

            
        var block1 = new THREE.Mesh(BlockGeometry, BlockMaterial);
        block1.position.set(-1, .9, 0);
        block1.receiveShadow = true;
        block1.castShadow = true;
        block1.name = "0";
        Blocks.push(block1);
        scene.add(block1);

        var block2 = block1.clone();
        block2.position.set(0, .9, 0);
        block2.name = "1";
        Blocks.push(block2);
        scene.add(block2);

        var block3 = block1.clone();
        block3.position.set(1, .9, 0);
        block3.name = "2";
        Blocks.push(block3);
        scene.add(block3);

        var block4 = block1.clone();
        block4.position.set(-1, 0, 0);
        block4.name = "3";
        Blocks.push(block4);
        scene.add(block4);

        var block5 = block1.clone();
        block5.position.set(0, 0, 0);
        block5.name = "4";
        Blocks.push(block5);
        scene.add(block5);

        var block6 = block1.clone();
        block6.position.set(1, 0, 0);
        block6.name = "5";
        Blocks.push(block6);
        scene.add(block6);

        var block7 = block1.clone();
        block7.position.set(-1, -.9, 0);
        block7.name = "6";
        Blocks.push(block7);
        scene.add(block7);

        var block8 = block1.clone();
        block8.position.set(0, -.9, 0);
        block8.name = "7";
        Blocks.push(block8);
        scene.add(block8);

        var block9 = block1.clone();
        block9.position.set(1, -.9, 0);
        block9.name = "8";
        Blocks.push(block9);
        scene.add(block9);

    });
}

//External 3D models of Robots 
//placed on table and larger one placed behind opposing side of the table
var tank1, tank2;
var tanksloaded = false;
function addTanks() {
    (new THREE.ObjectLoader()).load('models/enemy-robot.json', function (obj) {
        tank1 = obj;
        tank1.scale.set(.005, .005, .005);
        tank1.rotation.y = (Math.PI);

        tank1.rotation.x = (Math.PI / 2);
        tank1.position.set(-2.05, 0, 0);
        scene.add(tank1);

        tank2 = tank1.clone();
        tank2.position.set(2.05, 0, 0);
        scene.add(tank2);

        tank3 = tank1.clone();
        tank3.scale.set(.05, .05, .05);
        tank3.position.set(-.1, 3, -4);
        scene.add(tank3);

        tanksloaded = true;
    });
}

//Animates rotating movement of the mini robots
function maintainTankMovement() {
    if (tanksloaded) {
        tank1.rotation.y += 0.02;
        tank2.rotation.y += 0.02;
    }
}

//External 3D models of rings, placed on table surround mini robots
var ring1, ring2;
function addRings() {
    (new THREE.ObjectLoader()).load('models/plain-ring.json', function (obj) {
        ring1 = obj;
        ring1.scale.set(.35, .35, .35);
        ring1.receiveShadow = true;
        ring1.castShadow = true;

        ring1.position.set(-2, 0, .35);
        ring1.rotation.y = (Math.PI/180)*25;
        scene.add(ring1);

        ring2 = ring1.clone();
        ring2.position.set(2, 0, .35);
        ring2.rotation.y = -(Math.PI/180)*25;
        scene.add(ring2);

    });
}

//Creates an X object when called upon. Placed on designated square
var Pieces = [];
function createX(xcoord, ycoord) {
    var blockGeometry = new THREE.BoxGeometry(.075, .85, .05);
    var blockMaterial = new THREE.MeshLambertMaterial({ color: 0x2196F3 });

    var Xleft = new THREE.Mesh(blockGeometry, blockMaterial);
    Xleft.rotation.z = -(Math.PI / 4);
    Xleft.receiveShadow = true;
    Xleft.castShadow = true;

    var Xright = Xleft.clone();
    Xright.rotation.z = (Math.PI / 4);

    scene.add(Xleft);
    scene.add(Xright);

    var Xobj = new THREE.Object3D();
    Xobj.add(Xleft);
    Xobj.add(Xright);

    Xobj.position.set(xcoord, ycoord, .15);
    Pieces.push(Xobj);

    scene.add(Xobj);
}

//Creates an O object when called. Placed on designated square.
function createO(xcoord, ycoord) {
    var ringGeometry = new THREE.TorusGeometry(.325, .05, 75, 75);
    var ringMaterial = new THREE.MeshLambertMaterial({ color: 0xF44336 });

    var Oobj = new THREE.Mesh(ringGeometry, ringMaterial);
    Oobj.receiveShadow = true;
    Oobj.castShadow = true;

    Oobj.position.set(xcoord, ycoord, .15);

    Pieces.push(Oobj);
    scene.add(Oobj);
}

//When mouse moves, obtain the x and y coordinate of its location
function onDocumentMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (selectedobject != null) {
        var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
        vector.unproject(camera);
        raycaster.set(camera.position, vector.sub(camera.position).normalize());

        var intersects = raycaster.intersectObject(plane);
    }

}

//When mouse clicks down, obtain data for the selected object. Can only select the squares used in the game
var x, y, z;
function onDocumentMouseDown(event) {
    event.preventDefault();

    var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
    vector.unproject(camera);
    raycaster.set(camera.position, vector.sub(camera.position).normalize());

    var intersects = raycaster.intersectObjects(Blocks, true);
    if (intersects.length > 0) {
        var obj = intersects[0].object;

        selectedobject = obj;
    }

}

//States for determining what object is currently placed on a square
var STATES = {
    n: 0,
    x: 1,
    o: 2
}

//Array of entire 3x3 grid, starts off with nothing placed on each square
var boardStates = [[STATES.n, 0], [STATES.n, 1], [STATES.n, 2], [STATES.n, 3], [STATES.n, 4], [STATES.n, 5], [STATES.n, 6], [STATES.n, 7], [STATES.n, 8]];


function onDocumentMouseUp(event) {
    event.preventDefault();

    if (selectedobject !== undefined) {

        //Once selected object is found, obtain the index of it placed in the 3x3 grid. If
        //the square is currently empty, continue placing an X. Update boardStates array with X placed at 
        //given indices. Check for a winner after placing X.
        //Not possible to place an object if either player or opponent has won game.
        var index = parseInt(selectedobject.name);
        if (boardStates[index][0] === STATES.n) {
            var opponentState = determineWinner(); 
            
            if(opponentState !== STATES.o && opponentState !== STATES.x){
                place.play();
                createX(selectedobject.position.x, selectedobject.position.y);
                boardStates[index][0] = STATES.x;    
            }

            var available = boardStates.filter(function (element) {
                return element[0] === STATES.n;
            });

            var playerState = determineWinner();

            //If there are still available moves left AND player/opponent has not yet won, continue placing an
            //O at a random available space. Check for a winner after move has been made
            if (available.length > 0 && playerState !== STATES.x && playerState !== STATES.o) {
                var opponentIndex = available[Math.floor(Math.random() * available.length)][1];

                boardStates[opponentIndex][0] = STATES.o;
                var opponentObject = Blocks.find(function (element) {
                    return element.name === '' + opponentIndex;
                });

                enemy.play();
                createO(opponentObject.position.x, opponentObject.position.y);

                determineWinner();
            }
        }

        selectedobject = undefined;
    }
}

//Checks for winner. If three of the same are connected either vertically, horizontally, or diagonally, winner is determined.
function determineWinner() {
    function checkForWinner() {
        function checkEquality(e1, e2, e3) {
            return (e1 === e2 && e2===e3 && e1===e3);
        }
        for (var k = 0; k < 3; k++) {
            if (checkEquality(boardStates[k][0], boardStates[k + 3][0], boardStates[k+6][0])) // vertical
                return boardStates[k][0];
            else if (checkEquality(boardStates[k*3][0], boardStates[k*3 + 1][0], boardStates[k*3 + 2][0])) // horizontal
                return boardStates[k*3][0];
        }

        if (checkEquality(boardStates[0][0], boardStates[4][0], boardStates[8][0]))
            return boardStates[0][0];
        else if (checkEquality(boardStates[2][0], boardStates[4][0], boardStates[6][0]))
            return boardStates[2][0];

        return STATES.n;
    }

    var winner = checkForWinner();

    if (winner === STATES.x){
        createWinnerText("You Won!");
        victory.play();
    }
    else if (winner === STATES.o){
        createWinnerText("You Lost!");
        lose.play();
    }

    return winner;
}

//Text is created depending on winner of game.
var texts = []
function createWinnerText(winner)
{  
    var winnerString = winner;
    (new THREE.FontLoader()).load("fonts/Life's a Beach_Medium.json", function(font){
        var textGeometry = new THREE.TextGeometry(winnerString, {
            font: font,

            size: .55,
            height: .15,

            bevelEnabled: false,
        });
        var textMaterial = new THREE.MeshLambertMaterial({color: 0xCFD8DC});

        var winnerText = new THREE.Mesh(textGeometry, textMaterial);

        winnerText.rotation.x = (Math.PI/180)*35;
        winnerText.position.set(-1.35, -.25, .5);

        winnerText.castShadow = true;
        texts.push(winnerText);

        scene.add(winnerText);
    });
}

window.onload = init;