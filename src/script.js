import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
const canvas = document.querySelector('.webgl')
import vertex from './Shaders/firefliesVertex.glsl'
import fragment from './Shaders/firefliesFragment.glsl'
import words from './dictionary.json'


class NewScene{
    constructor(){
        this._Init()
    }
    
    _Init(){
        this.scene = new THREE.Scene()
        this.clock = new THREE.Clock()
        this.InitEnv()
        this.InitLogic()
        this.InitfontLoader()
        this.InitFireFlies()
        this.InitCamera()
        this.InitLights()
        this.InitRenderer()
        this.InitControls()
        this.Update()
        window.addEventListener('resize', () => {
            this.Resize()
        })
    }

    InitEnv(){
        this.platformGeometry = new THREE.PlaneBufferGeometry(5, 5)
        this.platformMaterial = new THREE.MeshBasicMaterial({ color:0xff0000, side: THREE.DoubleSide })
        this.platform = new THREE.Mesh(this.platformGeometry, this.platformMaterial)
        //this.scene.add(this.platform)
        this.platform.rotation.x = -Math.PI * 0.5
    }

    InitLogic(){
        const json = words
        console.log(json)
        this.randomWordIndex = Math.floor(Math.random() * json.words.length)
        console.log(this.randomWordIndex)
        this.word = json.words[this.randomWordIndex].word
        this.def = json.words[this.randomWordIndex].def
        console.log(this.word)
        console.log(this.def) 
    }

    InitfontLoader(){
        this.fontloader = new THREE.FontLoader()
        this.fontloader.load(
            './Abel/Abel_Regular.json',
            (font) => {
                this.textParameters = {
                        font: font,
                        size: 0.5,
                        height: 0.1,
                        curveSegments: 12,
                        bevelEnabled: true,
                        bevelThickness: 0.03,
                        bevelSize: 0.02,
                        bevelOffset: 0,
                        bevelSegments: 5
                    }
                
                //Word    
                this.textGeometry = new THREE.TextGeometry(
                    `${this.word}`,
                    this.textParameters
                )
                this.textMaterial = new THREE.MeshNormalMaterial()
                this.text = new THREE.Mesh(this.textGeometry, this.textMaterial)
                this.scene.add(this.text)
                this.textGeometry.computeBoundingBox()
                this.textGeometry.center()
                this.text.position.set(0, 0.7, 0)

                //Definition
                this.definitionGeometry = new THREE.TextGeometry(
                    `${this.def}`,
                    this.textParameters
                )
                this.definitionMaterial = new THREE.MeshNormalMaterial()
                this.defText = new THREE.Mesh(this.definitionGeometry, this.definitionMaterial)
                this.scene.add(this.defText)
                this.definitionGeometry.computeBoundingBox()
                this.definitionGeometry.center()
                this.defText.position.set(0, 0.0, 0)
                this.definitionGeometry.scale(0.4, 0.4, 0.4)

            }
        )
    }

    InitFireFlies(){
        this.firefliesGeometry = new THREE.BufferGeometry()
        this.firefliesCount = 100
        this.positionArray = new Float32Array(this.firefliesCount * 3)
        this.scaleArray = new Float32Array(this.firefliesCount)
        for(let i = 0; i < this.firefliesCount; i++){
            this.positionArray[i * 3 + 0] = (Math.random() - 0.5) * 8
            this.positionArray[i * 3 + 1] = (Math.random() - 0.2) * 4
            this.positionArray[i * 3 + 2] = (Math.random() - 0.5) * 8

            this.scaleArray[i] = Math.random()
        }
        this.firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(this.positionArray, 3))
        this.firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(this.scaleArray, 1))

        this.firefliesMaterial = new THREE.ShaderMaterial({
            uniforms: {
                u_time: { value: 0},
                u_pixelRatio: { value: Math.min(window.devicePixelRatio, 2)},
                u_size: { value: 100 }
            },
            vertexShader: vertex,
            fragmentShader: fragment,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })
        this.fireflies = new THREE.Points(this.firefliesGeometry, this.firefliesMaterial)
        this.scene.add(this.fireflies)
    }

    

    InitCamera(){
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100)
        this.camera.position.set(2, 0.5, 5)
        this.scene.add(this.camera)
    }

    InitLights(){
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
        this.scene.add(this.ambientLight)
    }

    InitControls(){
        this.controls = new OrbitControls(this.camera, canvas)
        this.controls.enableDamping = true
        this.controls.update()
    }

    Resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.firefliesMaterial.uniforms.u_pixelRatio.value = Math.min(window.devicePixelRatio, 2)
    }

    InitRenderer(){
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
        })
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.outputEncoding = THREE.sRGBEncoding
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.render(this.scene, this.camera)
        this.renderer.setClearColor(0x01152d)
    }

    Update(){
        requestAnimationFrame(() => {
            this.elaspsedTime = this.clock.getElapsedTime()
            this.firefliesMaterial.uniforms.u_time.value = this.elaspsedTime     
            this.renderer.render(this.scene, this.camera)
            this.controls.update()
            this.Update()
        })  
    }
}

let _APP = null

window.addEventListener('DOMContentLoaded', () => {
    _APP = new NewScene()
})