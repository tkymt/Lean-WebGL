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