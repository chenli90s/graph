import * as THREE from 'three'
import Stats from 'stats-js'
import OrbitControls from 'three-orbitcontrols'
import TWEEN from 'tween'


class ThreeDWorld {
    constructor(canvasContainer) {
        // canvas容器
        this.container = canvasContainer || document.body;
        // 创建场景
        this.createScene();
        // 创建灯光
        this.createLights();
        // 性能监控插件
        this.initStats();
        // 物体添加
        // this.addObjs();
        // 轨道控制插件（鼠标拖拽视角、缩放等）
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.autoRotate = true;
        // 循环更新渲染场景
        this.update();

        // 添加绑定事件
        this.addMouseListener()
    }

    /*
     创建场景
     */
    createScene() {
        this.HEIGHT = window.innerHeight;
        this.WIDTH = window.innerWidth;
        // 创建场景
        this.scene = new THREE.Scene();
        // 在场景中添加雾的效果，参数分别代表‘雾的颜色’、‘开始雾化的视线距离’、刚好雾化至看不见的视线距离’
        this.scene.fog = new THREE.Fog(0x090918, 500, 900);
        // 创建相机
        let aspectRatio = this.WIDTH / this.HEIGHT;
        let fieldOfView = 60;
        let nearPlane = 1;
        let farPlane = 10000;
        /**
         * PerspectiveCamera 透视相机
         * @param fieldOfView 视角
         * @param aspectRatio 纵横比
         * @param nearPlane 近平面
         * @param farPlane 远平面
         */
        this.camera = new THREE.PerspectiveCamera(
            fieldOfView,
            aspectRatio,
            nearPlane,
            farPlane
        );

        // 设置相机的位置
        this.camera.position.x = 0;
        this.camera.position.z = 400;
        this.camera.position.y = 0;
        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({
            // 在 css 中设置背景色透明显示渐变色
            alpha: true,
            // 开启抗锯齿
            antialias: true
        });
        // 渲染背景颜色同雾化的颜色
        this.renderer.setClearColor(this.scene.fog.color);
        // 定义渲染器的尺寸；在这里它会填满整个屏幕
        this.renderer.setSize(this.WIDTH, this.HEIGHT);

        // 打开渲染器的阴影地图
        this.renderer.shadowMap.enabled = true;
        // this.renderer.shadowMapSoft = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        // 在 HTML 创建的容器中添加渲染器的 DOM 元素
        this.container.appendChild(this.renderer.domElement);
        // 监听屏幕，缩放屏幕更新相机和渲染器的尺寸
        window.addEventListener('resize', this.handleWindowResize.bind(this), false);
    }


    // 窗口大小变动时调用
    handleWindowResize() {
        // 更新渲染器的高度和宽度以及相机的纵横比
        this.HEIGHT = window.innerHeight;
        this.WIDTH = window.innerWidth;
        this.renderer.setSize(this.WIDTH, this.HEIGHT);
        this.camera.aspect = this.WIDTH / this.HEIGHT;
        this.camera.updateProjectionMatrix();
    }


    createLights() {
        // 户外光源
        // 第一个参数是天空的颜色，第二个参数是地上的颜色，第三个参数是光源的强度
        this.hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9);

        // 环境光源
        this.ambientLight = new THREE.AmbientLight(0xdc8874, .2);

        // 方向光是从一个特定的方向的照射
        // 类似太阳，即所有光源是平行的
        // 第一个参数是关系颜色，第二个参数是光源强度
        this.shadowLight = new THREE.DirectionalLight(0xffffff, .9);

        // 设置光源的位置方向
        this.shadowLight.position.set(50, 50, 50);

        // 开启光源投影
        this.shadowLight.castShadow = true;

        // 定义可见域的投射阴影
        this.shadowLight.shadow.camera.left = -400;
        this.shadowLight.shadow.camera.right = 400;
        this.shadowLight.shadow.camera.top = 400;
        this.shadowLight.shadow.camera.bottom = -400;
        this.shadowLight.shadow.camera.near = 1;
        this.shadowLight.shadow.camera.far = 1000;

        // 定义阴影的分辨率；虽然分辨率越高越好，但是需要付出更加昂贵的代价维持高性能的表现。
        this.shadowLight.shadow.mapSize.width = 2048;
        this.shadowLight.shadow.mapSize.height = 2048;

        // 为了使这些光源呈现效果，需要将它们添加到场景中
        this.scene.add(this.hemisphereLight);
        this.scene.add(this.shadowLight);
        this.scene.add(this.ambientLight);
    }

    // 物体添加
    addObjs() {
        // 红色方块
        let cube = new THREE.BoxGeometry(20, 20, 20);
        let mat = new THREE.MeshPhongMaterial({
            color: new THREE.Color(0xff0000)
        });
        let m_cube = new THREE.Mesh(cube, mat);
        m_cube.castShadow = true;
        m_cube.position.x = -20;

        // 白色方块
        let cube2 = new THREE.BoxGeometry(20, 20, 20);
        let mat2 = new THREE.MeshPhongMaterial({
            color: new THREE.Color(0xffffff)
        });
        let m_cube2 = new THREE.Mesh(cube, mat2);
        m_cube2.castShadow = true;
        m_cube2.position.x = 20;

        // 物体添加至场景
        this.scene.add(m_cube);
        this.scene.add(m_cube2);
    }

    // 初始化监控
    initStats() {
        this.stats = new Stats();
        // 将性能监控屏区显示在左上角
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.bottom = '0px';
        this.stats.domElement.style.zIndex = 100;
        this.container.appendChild(this.stats.domElement);
    }

    // 循环更新渲染
    update() {
        // 动画插件
        TWEEN.update();
        // 性能监测插件
        this.stats.update();
        // 渲染器执行渲染
        this.renderer.render(this.scene, this.camera);
        // 循环调用
        requestAnimationFrame(() => {
            this.update()
        });
    }


    createNode(node) {
        node.geometry = new THREE.SphereGeometry(4, 16, 16);
        node.material = new THREE.MeshBasicMaterial({color: 0xff0000});
        node.circle = new THREE.Mesh(node.geometry, node.material);
        node.circle.castShadow = true;
        // node.circle.position.x = node.x
        // node.circle.position.y = node.y
        // node.circle.position.z = node.z
        // node.circle.on('hover', () => {
        //     console.log('+++++++')
        //     let tween = new TWEEN.Tween(this.scale).to({
        //         x: 0.3,
        //         y: 0.3,
        //         z: 0.3
        //     }, 200).easing(TWEEN.Easing.Quadratic.InOut).start();
        // }, function () {
        //     let tween = new TWEEN.Tween(this.scale).to({
        //         x: 0.2,
        //         y: 0.2,
        //         z: 0.2
        //     }, 200).easing(TWEEN.Easing.Quadratic.InOut).start();
        //
        // })
        this.scene.add(node.circle)
    }


    createLink(link) {
        // link.material = new THREE.LineBasicMaterial({ color: 0xAAAAAA });
        link.material = new THREE.LineBasicMaterial({color: 0xAAAAAA});
        link.geometry = new THREE.Geometry();
        link.line = new THREE.Line(link.geometry, link.material);
        link.line.castShadow = true;
        // link.line.geometry.verticesNeedUpdate = true
        link.line.geometry.vertices[0] = new THREE.Vector3(0, 0, 0)
        link.line.geometry.vertices[1] = new THREE.Vector3(0, 0, 0)
        this.scene.add(link.line)
    }


    addMouseListener() {
        // 层层往上寻找模型的父级，直至它是场景下的直接子元素
        function parentUtilScene(obj) {
            if (obj.parent.type === 'Scene') return obj;
            while (obj.parent && obj.parent.type !== 'Scene') {
                obj = obj.parent;
            }
            return obj;
        }

        // canvas容器内鼠标点击事件添加
        this.container.addEventListener("mousedown", (event) => {
            this.handleRaycasters(event, (objTarget) => {
                // 寻找其对应父级为场景下的直接子元素
                let object = parentUtilScene(objTarget);
                // 调用拾取到的物体的点击事件
                object._click && object._click(event);
                // 遍历场景中除当前拾取外的其他物体，执行其未被点击到的事件回调
                this.scene.children.forEach((objItem) => {
                    if (objItem !== object) {
                        objItem._clickBack && objItem._clickBack();
                    }
                });
            });
        });
        // canvas容器内鼠标移动事件添加
        this.container.addEventListener("mousemove", (event) => {
            this.handleRaycasters(event, (objTarget) => {
                // 寻找其对应父级为场景下的直接子元素
                let object = parentUtilScene(objTarget);
                // 鼠标移动到拾取物体上且未离开时时，仅调用一次其悬浮事件方法
                !object._hover_enter && object._hover && object._hover(event);
                object._hover_enter = true;
                // 遍历场景中除当前拾取外的其他物体，执行其未有鼠标悬浮的事件回调
                this.scene.children.forEach((objItem) => {
                    if (objItem !== object) {
                        objItem._hover_enter && objItem._hoverBack && objItem._hoverBack();
                        objItem._hover_enter = false;
                    }
                });
            })
        });
        // 为所有3D物体添加上“on”方法，可监听物体的“click”、“hover”事件
        THREE.Object3D.prototype.on = function (eventName, touchCallback, notTouchCallback) {
            switch (eventName) {
                case "click":
                    this._click = touchCallback ? touchCallback : undefined;
                    this._clickBack = notTouchCallback ? notTouchCallback : undefined;
                    break;
                case "hover":
                    this._hover = touchCallback ? touchCallback : undefined;
                    this._hoverBack = notTouchCallback ? notTouchCallback : undefined;
                    break;
                default:
                    ;
            }
        }
    }

    // 射线处理
    handleRaycasters(event, callback) {
        let mouse = new THREE.Vector2();
        let raycaster = new THREE.Raycaster();
        mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, this.camera);
        let intersects = raycaster.intersectObjects(this.scene.children, true)
        if (intersects.length > 0) {
            callback && callback(intersects[0].object);
        }
    }

}

export default ThreeDWorld

