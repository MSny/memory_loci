var VERSION = 1.0, 
    AUTHOR = "Brian Servia";
//1,37,50,75=frame, 

//30=bottomtv,31,73,81=tv,8,69=shelftoptv

//3,12,6,7,38,43,57,62,64,77,82,87,101,104=lcouch, 
//9,15,19,22,24,32,39,65,74,90,93,96,97,111=rcouch, 

//2,10,28,47,99,106=rtable, 
//16,36,68,78,84,95=ltable,

//4,112,11,14,49,52,71,103=bathroom, 


//27=backwallbed,46=door,26,41,100=bathroomwall,58=allwalls
//67=floor

//13,40=lamptop,53,70,85,88=lampstand,
//51=bowl,18=tableunderbowl

//89=mirrortopbed,94,108=bed,23,29=pillow, 


//25,35,42,44,45,59,60,79,80,86,102,105,110=chair2, 
//5,17,20,21,33,34,48,56,61,76,91,92,109=chair1,


//54=ldrawer,55=mdrawer,83=rdrawer
//0,63=mats,66=desk,72,98,107=backframes


//total of 113 meshes


var scene;
var camera;
var cubes = [];
var wscs = [];
var target;
var target2;
var particleSystem;
var haloCenter = new BABYLON.Vector3(0, 0, 0);
var leftController;

var objectSelected = false;
var objectSelecting = false;
var currentMeshSelected = null;
var teleportationAllowed;


var createScene = function() {
	scene = new BABYLON.Scene(engine);
    createCamera();

    var light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 6, 0), scene);
    console.log("created Camera");
  
    loadAssets();
    createTargetMesh();
    createParticles();

    scene.registerBeforeRender(function () {
        for (var i=0; i < cubes.length; i++) {
		    cubes[i].rotation.y += 0.01;
        } 
        castRayAndSelectObject();
	});

    scene.onPrePointerObservable.add( function(pointerInfo, eventState) {
        // on double tap/click
        if (!teleportationAllowed) {
            return;
        }

        camera.position.x = haloCenter.x;
        camera.position.z = haloCenter.z;

    }, BABYLON.PointerEventTypes.POINTERDOUBLETAP, false);

	return scene;
};

var createCamera = function() {
    if (navigator.getVRDisplays) {
        camera = new BABYLON.WebVRFreeCamera("camera1", new BABYLON.Vector3(0, 2, 0), scene);
    }
    else {
        camera = new BABYLON.VRDeviceOrientationFreeCamera("vrCam", new BABYLON.Vector3(0, 1, 0), scene);
    }

    // Touch or click the rendering canvas to enter VR Mode
    scene.onPointerDown = function () {
        scene.onPointerDown = undefined
        camera.attachControl(canvas, true);

        if (camera.controllers) {
            camera.controllers.forEach((gp) => {
                if (gp.hand === "left") {
                    leftController = gp._mesh;

                    gp.onMainButtonStateChangedObservable.add(function (stateObject) {
                        // on double tap/click
                        if (!teleportationAllowed || stateObject.value === 0) {
                            return;
                        }
                        camera.position.x = haloCenter.x;
                        camera.position.z = haloCenter.z;
                    });
                }
            });
        }
    }
};





var createParticles = function() {
    // Create a particle system
    particleSystem = new BABYLON.ParticleSystem("particles", 500, scene);
    particleSystem.particleTexture = new BABYLON.Texture("textures/Flare.png", scene);
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.3;
    particleSystem.minEmitPower = 1.0;
    particleSystem.maxEmitPower = 2.0;
    particleSystem.minLifeTime = 0.5;
    particleSystem.maxLifeTime = 1.0;
    particleSystem.emitter = BABYLON.Vector3.Zero();
    particleSystem.emitRate = 500;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0);
    particleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0);
    particleSystem.gravity = new BABYLON.Vector3(0, -0.5, 0);
    particleSystem.direction1 = new BABYLON.Vector3(0, 0.5, 0);
    particleSystem.direction2 = new BABYLON.Vector3(0, 0.05, 0);

    var alpha = 0;
    scene.registerBeforeRender(function () {
        // animate halo
        particleSystem.emitter.x = haloCenter.x + 0.5 * Math.cos(alpha);
        particleSystem.emitter.y = haloCenter.y;
        particleSystem.emitter.z = haloCenter.z + 0.5  * Math.sin(alpha);

        alpha += 0.5 * scene.getAnimationRatio();
	});
}

var createSky = function() {
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 100.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
};

var loadAssets = function() {
    engine.enableOfflineSupport = false;
    var assetsManager = new BABYLON.AssetsManager(scene);
    var meshTask1 = assetsManager.addMeshTask("TowerA", "", "https://david.blob.core.windows.net/babylonjs/utd/assets/models/towers/", "TA1.babylon");
    var meshTask2 = assetsManager.addMeshTask("TowerB", "", "https://david.blob.core.windows.net/babylonjs/utd/assets/models/towers/", "TB1.babylon");
    var meshTask3 = assetsManager.addMeshTask("TowerC", "", "https://david.blob.core.windows.net/babylonjs/utd/assets/models/towers/", "TC1.babylon");
    var meshTask4 = assetsManager.addMeshTask("Tree", "", "https://david.blob.core.windows.net/babylonjs/utd/assets/models/trees/", "T3.babylon");
    var meshTask5 = assetsManager.addMeshTask("BigTowerC", "", "https://david.blob.core.windows.net/babylonjs/utd/assets/models/towers/", "TC3.babylon");
 
    meshTask1.onSuccess = function (task) {
        task.loadedMeshes[0].position = new BABYLON.Vector3(5, 0, 5);
        task.loadedMeshes[0].scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
        task.loadedMeshes[0].isPickable = false;
    }

    meshTask2.onSuccess = function (task) {
        task.loadedMeshes[0].position = new BABYLON.Vector3(-5, 0, 5);
        task.loadedMeshes[0].scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
        task.loadedMeshes[0].isPickable = false;
    }

    meshTask3.onSuccess = function (task) {
        task.loadedMeshes[0].position = new BABYLON.Vector3(5, 0, -5);
        task.loadedMeshes[0].scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
        task.loadedMeshes[0].isPickable = false;
    }

    meshTask4.onSuccess = function (task) {
        task.loadedMeshes[0].position = new BABYLON.Vector3(-5, 0, -5);
        task.loadedMeshes[0].scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
        task.loadedMeshes[0].isPickable = false;
    }

    meshTask5.onSuccess = function (task) {
        task.loadedMeshes[0].position = new BABYLON.Vector3(0, 0, 15);
        task.loadedMeshes[0].scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
        task.loadedMeshes[0].isPickable = false;
    }

    assetsManager.load();
}

var createTargetMesh = function () {
    target = BABYLON.Mesh.CreateSphere("sphere", 12, 0.025, scene);
    var targetMat = new BABYLON.StandardMaterial("targetMat", scene);
    targetMat.emissiveColor = BABYLON.Color3.Green();
    target.material = targetMat;
    target.parent = camera;
    target.position.z = 2;

}

function vecToWorld(vector, camera){
    var m = camera.getWorldMatrix();
    var v = BABYLON.Vector3.TransformNormal(vector, m);
    return v;		 
}

function predicate(mesh){
    if (mesh.name.indexOf("cube") !== -1 || mesh.name.indexOf("ground") !== -1){
        return true;
    }
    return false;
}

function unselect() {
    objectViewed = false;
    objectSelecting = false;
    objectSelected = false;
    target.scaling.x = 1;
    target.scaling.y = 1;
    target.scaling.z = 1;
    if (!currentMeshSelected) {
        return;
    }
    currentMeshSelected.material.diffuseColor = BABYLON.Color3.White();
}

function moveTeleportationSelectorTo(coordinates) {
    teleportationAllowed = true;
    haloCenter.copyFrom(coordinates);
    particleSystem.start();
}

var helper;
var mouseOnly = false;

var castRayAndSelectObject = function(){      
    var leftCamera = camera._rigCameras[0];

    if (!leftCamera) {
        return;
    } 

    var origin;
    var direction;
    if (mouseOnly || !leftController) {
        var m = leftCamera.getWorldMatrix();
        
        if (camera.devicePosition) {
            origin = camera.position.add(camera.devicePosition);
        }
        else {
            origin = camera.position;
        }

        var forward = new BABYLON.Vector3(0, 0, 1);
        forward = vecToWorld(forward, leftCamera);

        direction = BABYLON.Vector3.Normalize(forward);
    } else {
        var m = leftController.getWorldMatrix();
        origin = m.getTranslation();

        var forward = new BABYLON.Vector3(0, 0, -1);
        forward = vecToWorld(forward, leftController);

        direction = BABYLON.Vector3.Normalize(forward);
    }

    var length = 100;
    var ray = new BABYLON.Ray(origin, direction, length);
    var hit = scene.pickWithRay(ray, predicate);

    if (helper) {
        helper.dispose();
    }

  //  if (!mouseOnly && leftController) {
        helper = BABYLON.RayHelper.CreateAndShow(ray, scene, new BABYLON.Color3(1, 1, 0.1));
   // }
    if (hit.pickedMesh) {
        if (hit.pickedMesh.name.indexOf("ground") !== -1) {
            unselect();
            moveTeleportationSelectorTo(hit.pickedPoint)
            return;
        }
        particleSystem.stop();
        teleportationAllowed = false;
        currentMeshSelected = hit.pickedMesh;
        if (!objectSelecting) {
            objectSelecting = true;
            currentMeshSelected.material.diffuseColor = BABYLON.Color3.Red();
        }

        if (target.scaling.x >= 2) {
            if (!objectSelected) {
                objectSelected = true;
                currentMeshSelected.material.diffuseColor = BABYLON.Color3.Blue();
            }
        }
        else {
            target.scaling.x += 0.02;
            target.scaling.y += 0.02;
            target.scaling.z += 0.02;
        }
    }
    else {
        teleportationAllowed = false;
        particleSystem.stop();
        unselect();
    }
}