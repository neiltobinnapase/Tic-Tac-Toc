var RANK = {
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
    SIX: 6,
    SEVEN: 7,
    EIGHT: 8,
    NINE: 9,
    TEN: 10,
    JACK: 11,
    QUEEN: 12,
    KING: 13,
    ACE: 14
}

var textures = new Map();

var cardTextureLoader = new THREE.TextureLoader();

function loadTextures() {
    var arr = [];
    var arr2 = [];
    
    for (var rank in RANK) {
        var name = 'cards/RedandBlack' + RANK[rank] + '.png';
        console.log(name);
        cardTextureLoader.load(name, function (texture) {
            arr.push('RedandBlack' + rank);
            arr2.push(texture);
        });
    }
    setTimeout(function() {
        console.log(arr);
        console.log(arr2);
        for (var i = 0; i < arr.length; i++) {
            textures.set(arr[i], arr2[i]);
        }
        console.log(textures);
    }, 2000);
    
}

cardTextureLoader.load('cards/Red.png', function (texture) {
    textures.set('red', texture);
});


// precondition: textures are all loaded
function makeCard(rank) {

    var returnObject = {};

    var frontGeometry = new THREE.PlaneGeometry(1, 1);
    var backGeometry = frontGeometry.clone();
    console.log(textures);
    var frontMat = new THREE.MeshPhongMaterial({ map: textures.get('RedandBlack' + rank), side: THREE.FrontSide });
    var backMat = new THREE.MeshPhongMaterial({ map: textures.get('red'), side: THREE.BackSide });
    var front = new THREE.Mesh(frontGeometry, frontMat);
    var back = new THREE.Mesh(backGeometry, backMat);

    var obj = new THREE.Object3D();
    obj.add(front);
    obj.add(back);
    obj.castShadow = true;
    returnObject.object = obj;
    returnObject.rank = rank;
    return returnObject;
}
