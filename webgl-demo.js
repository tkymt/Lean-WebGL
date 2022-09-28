main();

//
// ここから開始
//
function main(){
    const canvas = document.querySelector('#glCanvas');
    // GL コンテキストを初期化する
    const gl = canvas.getContext('webgl');

    // WebGL が使用可能で動作している場合にのみ続行します
    // 変数glがnullだったらmain関数をリターンして終了
    if (!gl){
        alert("WebGLを初期化できません。ブラウザーまたはマシンが対応していない可能性があります。");
        return;
    }

    // クリアカラーを黒に設定し、完全に不透明にします
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // 指定されたクリアカラーでカラーバッファーをクリアします
    gl.clear(gl.COLOR_BUFFER_BIT);


    // 頂点シェーダーのプログラム
    const vsSource = `
        attribute vec4 aVertexPosition;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        void main(){
           gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

        }
    `;

    // フラグメントシェーダーのプログラム
    const fsSource = `
        void main() {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
    `;

    // シェーダーのプログラムを初期化する
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    
    // シェーダープログラムを使用するために必要なすべての情報を収集します
    // シェーダープログラムが使用している属性を検索する
    // aVertexPositionの場合、均一な場所を検索します。
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
        },
        uniformLocation: {
            projectionMatrix: gl.getUniformLocation(
                shaderProgram,
                "uProjectionMatrix"
            ),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
        },
    }

    initBuffers(gl);

    // シーンを描画する
    drawScene(gl, programInfo);
}

// initBuffers
// 必要なバッファーを初期化します
// このデモでは、１つの単純な2次元の正方形のオブジェクトです
function initBuffers(gl) {
    // 正方形の位置のバッファーを作成します。
    const positionBuffer = gl.createBuffer();

    // 位置バッファーを適用するものとして選択します
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // 正方形の位置の配列を作成します
    const positions = [
         1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
        -1.0, -1.0
    ]

    // ポジションの配列をWebGLに渡して形状を構築します
    // これを行うことでJavaScriptの配列からfloat32Arrayを作成し、それを使用して現在のバッファーを埋めます
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
}

// シェーダープログラムを初期化して、WebGLがデータの描画方法を認識できるようにする
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // シェーダープログラムを作成する
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // もしシェーダープログラムを作成するのに失敗したらアラートを出力する
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
            "シェーダープログラムを初期化できません：" +
            gl.getProgramInfoLog(shaderProgram)
        );
        return null;
    }

    return shaderProgram;
}

// 指定されたタイプのシェーダーを作成する。ソースのアップロードとコンパイルをする。
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    
    // ソースをシェーダーオブジェクトに送信する
    gl.shaderSource(shader, source);

    // シェーダープログラムをコンパイルする
    gl.compileShader(shader);

    // 正常にコンパイルされたかどうかを確認する
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
            "シェーダーのコンパイル中にエラーが発生しました：" + gl.getShaderInfoLog(shader)
        );
        gl.deleteShader(shader);
    return null;
    }

    return shader;
}

function drawScene(gl, programInfo) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // 不透明の黒色でクリアする
    gl.clearDepth(1.0); // すべてをクリアする
    gl.enable(gl.DEPTH_TEST); // 深度テストを有効にする
    gl.depthFunc(gl.LEQUAL); // 近くのものは遠くのものを曖昧にする

    // 描画を開始する前に、キャンバスをクリアします
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 遠近法マトリクス
    // カメラの遠近法の歪みをシュミレートするために使用されます
    // 私たちの視野は45度で、幅と高さがあります
    // キャンバスの表示サイズに一致する比率
    // 0.1単位の間のオブジェクトのみを見たい
    // カメラから100ユニット離れています
    const fieldOfView = (45 * Math.PI) / 180; //ラジアン単位
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    // glmatrix.jsは結果を受け取る先として最初の引数を持ちます
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // 描画位置を「アイデンティティ」ポイントに設定します
    // シーンの中心です
    const modelViewMatrix = mat4.create();

    // 描画位置を目的の場所に移動します
    // 正方形の描画を開始します
    mat4.translate(
        modelViewMatrix, // 結果を受け取るマトリクス
        modelViewMatrix, // 移動するマトリクス
        [-0.0, 0.0, -6.0]
    );

    // 位置バッファーから頂点の一族性に位置を引き出す方法をWebGLに伝えます
    {
        const numComponents = 2;
        const type = gl.FLOAT;
        const nomalize = false;
        const stride = 0;
        const offset = 0;
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            nomalize,
            stride,
            offset
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }

    // 描画時に私たちのプログラムを使用するようにWebGLに指示する
    gl.useProgram(programInfo.program);

    // シェーダーユニフォームを設定する
    gl.uniformMatrix4fv(
        programInfo.uniformLocation.projectionMatrix,
        false,
        projectionMatrix
    );

    gl.uniformMatrix4fv(
        programInfo.uniformLocation.modelViewMatrix,
        false,
        modelViewMatrix
    );

    {
        const offset = 0;
        const vertexCount = 4;
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
}