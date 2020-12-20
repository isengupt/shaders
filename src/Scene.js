import React, { Component } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import DatGui, { DatNumber } from "@tim-soft/react-dat-gui";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import model from "./model/scene.glb";
import { vertex } from "./shaders/vertex";
import { fragment } from "./shaders/fragment";
import sky from "./model/11.jpg";

const params = {
  exposure: 1,
  bloomStrength: 1.5,
  bloomThreshold: 0,
  bloomRadius: 0
};

class Scene extends Component {
  constructor(props) {
    super(props);

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.animate = this.animate.bind(this);
  }

  componentDidMount() {
    this.scene = new THREE.Scene();
    this.width = this.mount.clientWidth;
    this.height = this.mount.clientHeight;


    this.camera = new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.time = 0;

    this.camera.position.set(0, 0, 7);
    this.mount.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.loader = new GLTFLoader();

    this.renderpass = new RenderPass( this.scene, this.camera );

 
    this.bloomPass = new UnrealBloomPass( new THREE.Vector2( this.width,this.height ), 1.5, 0.4, 0.85 );
    this.bloomPass.threshold = params.bloomThreshold;
    this.bloomPass.strength = params.bloomStrength;
    this.bloomPass.radius = params.bloomRadius;

    this.composer = new EffectComposer( this.renderer );
    this.composer.addPass( this.renderpass );
    this.composer.addPass( this.bloomPass );
 
    this.loader.load(model, (gltf) => {
      console.log(gltf);
      this.scene.add(gltf.scene);
   
      gltf.scene.position.y =-2.5
      gltf.scene.position.x = 0.5

      gltf.scene.rotateY(Math.PI / 12);
      gltf.scene.rotateX(Math.PI / 12)
      //gltf.scene.rotateX(Math.PI / 4);
      /*       
      gltf.scene.rotateY(0.55)
      gltf.scene.rotateZ(-0.1) */
      gltf.scene.traverse((o) => {
        if (o.isMesh) {
          o.geometry.center();
          o.scale.set(1.25, 1.25, 1.25);
          o.material = this.material;

          console.log(o);
        }
      });
    });

    /*  this.scene = scene
    this.camera = camera
    this.renderer = renderer
    this.material = material
    this.cube = cube */
    this.addObjects();
    this.resize();
    this.animate();
    this.setupResize();
  }

  addObjects() {
    let that = this;
    this.material = new THREE.ShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        sky: { type: "f", value: new THREE.TextureLoader().load(sky) },
        resolution: { type: "v4", value: new THREE.Vector4() },
        uvRate: {
          value: new THREE.Vector2(1, 1),
        },
      },
    });

    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    this.plane = new THREE.Mesh(this.geometry, this.material);

    //this.scene.add(this.plane);
    const light = new THREE.AmbientLight( 0x404040 );
    this.scene.add( light );
  }

  setupResize() {
    this.mount.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.mount.offsetWidth;
    this.height = this.mount.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;

    this.imageAspect = 853 / 1280;
    let a1;
    let a2;
    if (this.height / this.width > this.imageAspect) {
      a1 = (this.width / this.height) * this.imageAspect;
      a1 = 1;
    } else {
      a1 = 1;
      a2 = this.height / this.width / this.imageAspect;
    }
    this.camera.updateProjectionMatrix();
  }

  componentWillUnmount() {
    this.stop();
    this.mount.removeChild(this.renderer.domElement);
  }

  start() {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  }

  stop() {
    cancelAnimationFrame(this.frameId);
  }

  animate() {
    //this.cube.rotation.x += 0.01
    //this.cube.rotation.y += 0.01
    this.time += 0.05;
    //console.log(this.time)
    this.material.uniforms.time.value = this.time;

    this.frameId = window.requestAnimationFrame(this.animate.bind(this));
    this.renderScene();
  }

  renderScene() {
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return (
      <div
        style={{ width: "100vw", height: "100vh" }}
        ref={(mount) => {
          this.mount = mount;
        }}
      />
    );
  }
}

export default Scene;
