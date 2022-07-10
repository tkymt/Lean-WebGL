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
}
