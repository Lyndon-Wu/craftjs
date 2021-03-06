THREE = require('../../js/three.min')
require('../../js/TrackballControls')
require('./Projector')
require('./CanvasRenderer')
require('../../js/STLLoader')

var Viewer = module.exports = function(element) {
    this.renderer = null;
    this.controls = null;
    this.camera = null;
    this.scene = null;
    this.init(element);
};

var grids = [[1,0,0,0],[0,1,0,0],[0,0,1,0]];
var gridHelpers = [];

Viewer.prototype = {
    constructor: Viewer,

    setCameraPosition: function(x, y, z) {
        this.camera.position.set(x, y, z);
    },

    addCSGs: function(csgs) {

        this.initScene();

        var loader = new THREE.STLLoader();

        var self = this
        csgs.forEach(function(csg) {
            var stlstring = csg.stl
            var geometry = loader.parse(stlstring)
            var material = new THREE.MeshPhongMaterial({
                ambient: 0xff5533,
                // color: 0xff5533,
                color: csg.color,
                specular: 0x111111,
                shininess: 200
            });
            var mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(0, 0, 0);
            mesh.scale.set(0.02, 0.02, 0.02); //, 0.1, 0.1 );
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            self.scene.add(mesh);
        })
    },

    setStl: function(stlstring) {
        var loader = new THREE.STLLoader();
        var geometry = loader.parse(stlstring);
        var material = new THREE.MeshPhongMaterial({
            ambient: 0xff5533,
            color: 0xff5533,
            specular: 0x111111,
            shininess: 200
        });
        if (this.mesh) {
            this.scene.remove(this.mesh)
        }
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0, 0, 0);
        this.mesh.scale.set(0.02, 0.02, 0.02); //, 0.1, 0.1 );
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);
    },

    // Viewer.prototype.addStl = function(stlstring) {
    //     var loader = new THREE.STLLoader();
    //     var geometry = loader.parse(stlstring);
    //     var material = new THREE.MeshPhongMaterial({
    //         ambient: 0xff5533,
    //         color: 0x333355,
    //         specular: 0x111111,
    //         shininess: 100,
    //         opacity: 0.2,
    //         transparent: true
    //     });
    //     var mesh = new THREE.Mesh(geometry, material);
    //     mesh.position.set(0, 0, 0);
    //     mesh.scale.set(0.02, 0.02, 0.02); //, 0.1, 0.1 );
    //     mesh.castShadow = true;
    //     mesh.receiveShadow = true;
    //     this.scene.add(mesh);
    // }

    initScene: function() {
        // New Scene
        this.scene = new THREE.Scene();
        this.scene.fog = this.fog;
        this.scene.add(this.camera);

        //Grid

        //x - yz
        gridHelpers[gridHelpers.length] = new THREE.GridHelper(1, 0.05);
        gridHelpers[gridHelpers.length-1].material = new THREE.MeshBasicMaterial({transparent:true});
        gridHelpers[gridHelpers.length-1].rotation.z = Math.PI/2;
        this.scene.add(gridHelpers[gridHelpers.length-1]);

        //y - xz
        gridHelpers[gridHelpers.length] = new THREE.GridHelper(1, 0.05);
        gridHelpers[gridHelpers.length-1].material = new THREE.MeshBasicMaterial({transparent:true});
        gridHelpers[gridHelpers.length-1].rotation.y = Math.PI/2;
        this.scene.add(gridHelpers[gridHelpers.length-1]);

        //z - xy
        gridHelpers[gridHelpers.length] = new THREE.GridHelper(1, 0.05);
        gridHelpers[gridHelpers.length-1].material = new THREE.MeshBasicMaterial({transparent:true});
        gridHelpers[gridHelpers.length-1].rotation.x = Math.PI/2;
        this.scene.add(gridHelpers[gridHelpers.length-1]);

        // Lights
        this.scene.add(new THREE.AmbientLight(0x777777));
        this.addShadowedLight(1, 1, 1, 0xffffff, 1.35);
        this.addShadowedLight(0.5, 1, -1, 0xffaa00, 1);
        this.addShadowedLight(-1, -1, -1, 0xffaa00, 1);
    },

    init: function(element) {

        this.container = document.getElementById(element);
        this.fog = new THREE.Fog(0x72645b, 2, 15);


        if (0) {
            // Load STL (ASCII String)
            var loader = new THREE.STLLoader();
            var geometry = loader.parse(stlstring);
            var material = new THREE.MeshPhongMaterial({
                ambient: 0xff5533,
                color: 0xff5533,
                specular: 0x111111,
                shininess: 200
            });

            var mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(0, 0, 0);
            // mesh.rotation.set( 0, - Math.PI / 2, 0 );
            // mesh.scale.set( 0.5, 0.5, 0.5 );
            mesh.scale.set(0.02, 0.02, 0.02); //, 0.1, 0.1 );
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
        }

        // Camera
        this.camera = new THREE.PerspectiveCamera(35, this.container.clientWidth / this.container.clientHeight, 0.1, 100);
        this.camera.position.set(0, 0, 1);

        // renderer
        if (window.WebGLRenderingContext) {
            this.renderer = new THREE.WebGLRenderer({
                antialias: true
            })
        } else {
            this.renderer = new THREE.CanvasRenderer({
                preserveDrawingBuffer: true
            });
        }
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(this.fog.color, 1);
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.shadowMapEnabled = true;
        this.renderer.shadowMapCullFace = THREE.CullFaceBack;
        this.container.appendChild(this.renderer.domElement);


        this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.2;
        this.controls.noZoom = false;
        this.controls.noPan = false;
        this.controls.staticMoving = false;
        this.controls.dynamicDampingFactor = 0.3;
        this.controls.keys = [65, 83, 68];

        var self = this;
        this.controls.addEventListener('start', function() {
            // turn on the animatation at the start of a trackball control event
            self.animateOn();
        });

        this.controls.addEventListener('end', function() {
            // turn off the animatation at the start of a trackball control event
            self.animateOff();
        });
        // stats
        // stats = new Stats();
        // stats.domElement.style.position = 'absolute';
        // stats.domElement.style.top = '0px';
        // container.appendChild( stats.domElement );
        //
        window.addEventListener('resize', this.onWindowResize.bind(this), false);

        this.initScene();
    },

    addShadowedLight: function(x, y, z, color, intensity) {
        var directionalLight = new THREE.DirectionalLight(color, intensity);
        directionalLight.position.set(x, y, z)
        this.scene.add(directionalLight);
        directionalLight.castShadow = true;
        // directionalLight.shadowCameraVisible = true;
        var d = 1;
        directionalLight.shadowCameraLeft = -d;
        directionalLight.shadowCameraRight = d;
        directionalLight.shadowCameraTop = d;
        directionalLight.shadowCameraBottom = -d;
        directionalLight.shadowCameraNear = 1;
        directionalLight.shadowCameraFar = 4;
        directionalLight.shadowMapWidth = 1024;
        directionalLight.shadowMapHeight = 1024;
        directionalLight.shadowBias = -0.005;
        directionalLight.shadowDarkness = 0.15;
    },

    onWindowResize: function() {
        console.log("resized:" + this.container.id);
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.render(this.scene, this.camera);
    },

    // turn the animation on
    animateOn: function() {
        this.off = false;
        this.animate();
    },

    // turn the animation off
    animateOff: function() {
        this.off = true;
    },

    // animate continously, until it's turned off
    animate: function() {
        if (!this.off) {
            requestAnimationFrame(this.animate.bind(this));
        }
        this.render();
    },

    render: function() {
        this.controls.update();
        //calculate the angle between camera and the 3 grids
        //multiply alpha for grids by their relative angle

        //                                     /
        //calculate camera direction vector   v
        var dir = [ -this.camera.position.x,
                    -this.camera.position.y,
                    -this.camera.position.z];

        var length = Math.sqrt(Math.pow(dir[0],2) + Math.pow(dir[1],2) + Math.pow(dir[2],2));

        dir[0] = dir[0]/length;
        dir[1] = dir[1]/length;
        dir[2] = dir[2]/length;

        console.log(gridHelpers[0]);

        for(var i = 0; i < grids.length; i++)
        {
            //                           /
            //calculate relative angle  v
            var alpha = Math.sin(Math.acos(grids[i][0]*dir[0] + grids[i][1]*dir[1] + grids[i][2]*dir[2]));

            //
            //assign alpha - not done
            gridHelpers[i].material.opacity = Math.abs(alpha);
            console.log("ALPHA IS: ",gridHelpers[i].material.opacity);
        }

        this.renderer.render(this.scene, this.camera);
    }
};