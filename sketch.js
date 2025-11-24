let sheetA, sheetB, sheetC;
const framesA = 6; // all3.png
const framesB = 4; // all2.png
const framesC = 6; // all1.png
let idxA = 0, idxB = 0, idxC = 0;
let lastA = 0, lastB = 0, lastC = 0;
// 稍微放慢速度：150ms ≈ 6.7 FPS
const intervalA = 150; // ms per frame for A (~6.7 FPS)
const intervalB = 150; // ms per frame for B (~6.7 FPS)
const intervalC = 150; // ms per frame for C (~6.7 FPS)
const gap = 40; // pixel gap between animations
// 聲音相關
let oscA, oscB, oscC;
let soundStarted = false;

// 每個動畫的垂直振幅設定（像素）和振盪速度
const bobAmpA = 22;
const bobAmpC = 18;
const bobAmpB = 16;
const bobSpeed = 2.0; // 振盪速度調整器

function preload() {
  sheetA = loadImage('3/all3.png');
  // all2.png 存在於資料夾 `2`
  sheetB = loadImage('2/all2.png');
  // all1.png 存在於資料夾 `1`
  sheetC = loadImage('1/all1.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  noSmooth();
  frameRate(60);
}

function draw() {
  background('#d6ccc2');

  if (!sheetA || !sheetB) return;

  // 原始來源寬高
  const swA_full = sheetA.width / framesA;
  const shA = sheetA.height;
  const swB_full = sheetB.width / framesB;
  const shB = sheetB.height;
  const swC_full = sheetC.width / framesC;
  const shC = sheetC.height;

  // 更新幀索引（各自獨立）
  if (millis() - lastA > intervalA) {
    idxA = (idxA + 1) % framesA;
    lastA = millis();
  }
  if (millis() - lastB > intervalB) {
    idxB = (idxB + 1) % framesB;
    lastB = millis();
  }
  if (millis() - lastC > intervalC) {
    idxC = (idxC + 1) % framesC;
    lastC = millis();
  }

  // 來源剪裁（整數像素）
  const sxA = Math.floor(idxA * swA_full);
  let swA = Math.floor(swA_full);
  if (idxA === framesA - 1) swA = sheetA.width - sxA;

  const sxB = Math.floor(idxB * swB_full);
  let swB = Math.floor(swB_full);
  if (idxB === framesB - 1) swB = sheetB.width - sxB;

  const sxC = Math.floor(idxC * swC_full);
  let swC = Math.floor(swC_full);
  if (idxC === framesC - 1) swC = sheetC.width - sxC;

  // 預設顯示尺寸（使用來源寬度/高度作為自然尺寸）
  let dWA = swA;
  let dHA = shA;
  let dWB = swB;
  let dHB = shB;
  let dWC = swC;
  let dHC = shC;

  // 將兩張圖當作一個群組置中，必要時進行縮放以符合畫面
  const groupNatural = dWA + dWB + dWC + gap * 2;
  const maxGroup = width * 0.9; // 保留邊距
  let scale = 1;
  if (groupNatural > maxGroup) scale = maxGroup / groupNatural;

  dWA *= scale; dHA *= scale;
  dWB *= scale; dHB *= scale;
  dWC *= scale; dHC *= scale;

  // 計算並排位置：從左到右擺放 C (all1) then A (all3) then B (all2)
  const groupWidth = dWA + dWB + dWC + gap * 2;
  const startX = (width - groupWidth) / 2;
  // 調整排列為：all1 (C) 左、all3 (A) 中、all2 (B) 右
  const xC = startX + dWC / 2;
  const xA = startX + dWC + gap + dWA / 2;
  const xB = startX + dWC + gap + dWA + gap + dWB / 2;
  const baseY = height / 2;

  // 計算時間並產生垂直振幅（sin）
  const t = millis() / 1000;
  const bobA = Math.sin(t * bobSpeed + 0.0) * bobAmpA;
  const bobC = Math.sin(t * bobSpeed + 1.3) * bobAmpC;
  const bobB = Math.sin(t * bobSpeed + 2.1) * bobAmpB;

  // 在畫面上繪製三個動畫（維持長寬比），並以 bob 值位移（由左至右繪製）
  image(sheetC, xC, baseY + bobC, dWC, dHC, sxC, 0, swC, shC);
  image(sheetA, xA, baseY + bobA, dWA, dHA, sxA, 0, swA, shA);
  image(sheetB, xB, baseY + bobB, dWB, dHB, sxB, 0, swB, shB);

  // 若使用者已啟用聲音，根據振幅調整聲音參數
  if (soundStarted && oscA && oscB && oscC) {
    const aNorm = Math.min(1, Math.abs(bobA) / bobAmpA);
    const cNorm = Math.min(1, Math.abs(bobC) / bobAmpC);
    const bNorm = Math.min(1, Math.abs(bobB) / bobAmpB);

    // 將振幅映射到音量與頻率（平滑過渡）
    oscA.amp(aNorm * 0.25, 0.05);
    oscC.amp(cNorm * 0.25, 0.05);
    oscB.amp(bNorm * 0.25, 0.05);

    oscA.freq(220 + aNorm * 200, 0.05);
    oscC.freq(330 + cNorm * 200, 0.05);
    oscB.freq(440 + bNorm * 200, 0.05);
  }
  // 若尚未啟用聲音，顯示提示（使用者需點擊以啟用瀏覽器音訊）
  if (!soundStarted) {
    push();
    noStroke();
    fill(0, 120);
    rectMode(CENTER);
    rect(width/2, height - 40, 300, 36, 6);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(14);
    text('點擊畫面以啟用聲音', width/2, height - 40);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function startSound() {
  // 建立三個正弦振盪器，並設定 pan（左、中、右）
  oscA = new p5.Oscillator('sine');
  oscA.freq(220);
  oscA.amp(0);
  // all3 在中間，先設中間 pan
  oscA.pan(0);
  oscA.start();

  oscC = new p5.Oscillator('sine');
  oscC.freq(330);
  oscC.amp(0);
  // all1 放左側
  oscC.pan(-0.8);
  oscC.start();

  oscB = new p5.Oscillator('sine');
  oscB.freq(440);
  oscB.amp(0);
  oscB.pan(0.8);
  oscB.start();
}

function mousePressed() {
  // 由於瀏覽器限制，必須在使用者互動後才能啟用聲音
  if (!soundStarted) {
    startSound();
    soundStarted = true;
  }
}
