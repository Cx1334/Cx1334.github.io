<script setup>
import { ref } from 'vue';

// ---- 波特率计算器 ----
const pclk = ref('72');
const targetBaud = ref('115200');
const baudResult = ref(null);

function calculateBaud() {
  const f = parseFloat(pclk.value) * 1000000;
  const b = parseFloat(targetBaud.value);
  if (!f || !b) return;
  // USARTDIV = f_PCLK / (16 * Baud)（16 倍过采样）
  const div = f / (16 * b);
  const mantissa = Math.floor(div);
  const fraction = Math.round((div - mantissa) * 16);
  const actualBaud = f / (16 * (mantissa + fraction / 16));
  const error = ((actualBaud - b) / b) * 100;
  baudResult.value = { div: div.toFixed(4), error: error.toFixed(2) + '%', bad: Math.abs(error) > 2 };
}

// ---- 定时器溢出计算 ----
const timerFreq = ref('72');
const prescaler = ref('71');
const period = ref('999');
const timerResult = ref(null);

function calculateTimer() {
  const f = parseFloat(timerFreq.value) * 1000000;
  const psc = parseFloat(prescaler.value) + 1;
  const arr = parseFloat(period.value) + 1;
  if (!f || !psc || !arr) return;
  const updateFreq = f / (psc * arr);
  const updateTime = 1 / updateFreq;
  timerResult.value = {
    freq:
      updateFreq < 1000 ? `${updateFreq.toFixed(2)} Hz` : `${(updateFreq / 1000).toFixed(2)} KHz`,
    time:
      updateTime < 0.001
        ? `${(updateTime * 1000000).toFixed(2)} us`
        : `${(updateTime * 1000).toFixed(2)} ms`,
  };
}

// ---- 进制转换 ----
const dec = ref('');
const hex = ref('');
const bin = ref('');

function onDecChange(val) {
  dec.value = val;
  if (!val) {
    hex.value = '';
    bin.value = '';
    return;
  }
  const num = parseInt(val, 10);
  if (!Number.isNaN(num)) {
    hex.value = num.toString(16).toUpperCase();
    bin.value = num.toString(2);
  }
}
function onHexChange(val) {
  hex.value = val;
  if (!val) {
    dec.value = '';
    bin.value = '';
    return;
  }
  const num = parseInt(val, 16);
  if (!Number.isNaN(num)) {
    dec.value = num.toString(10);
    bin.value = num.toString(2);
  }
}
function onBinChange(val) {
  bin.value = val;
  if (!val) {
    dec.value = '';
    hex.value = '';
    return;
  }
  const num = parseInt(val, 2);
  if (!Number.isNaN(num)) {
    dec.value = num.toString(10);
    hex.value = num.toString(16).toUpperCase();
  }
}

// ---- ASCII / HEX 互转 ----
const asciiText = ref('');
const asciiHex = ref('');

function onAsciiTextChange(text) {
  asciiText.value = text;
  asciiHex.value = text
    .split('')
    .map((char) => char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'))
    .join(' ');
}
function onAsciiHexChange(hexStr) {
  asciiHex.value = hexStr;
  const cleanHex = hexStr.replace(/\s+/g, '');
  if (cleanHex.length % 2 !== 0) return;
  let str = '';
  for (let i = 0; i < cleanHex.length; i += 2) {
    const code = parseInt(cleanHex.substr(i, 2), 16);
    if (!Number.isNaN(code)) str += String.fromCharCode(code);
  }
  asciiText.value = str;
}
</script>

<template>
  <div class="tools">
    <div class="tool card">
      <h3>波特率计算器</h3>
      <label>
        <span>PCLK 频率 (MHz)</span>
        <input v-model="pclk" type="number" />
      </label>
      <label>
        <span>目标波特率</span>
        <select v-model="targetBaud">
          <option value="9600">9600</option>
          <option value="115200">115200</option>
          <option value="256000">256000</option>
          <option value="921600">921600</option>
        </select>
      </label>
      <button class="btn" type="button" @click="calculateBaud">计算</button>
      <div v-if="baudResult" class="result">
        <p><span>USARTDIV</span><code>{{ baudResult.div }}</code></p>
        <p>
          <span>误差率</span>
          <code :class="{ bad: baudResult.bad }">{{ baudResult.error }}</code>
        </p>
      </div>
    </div>

    <div class="tool card">
      <h3>定时器溢出计算</h3>
      <label>
        <span>Timer Clock (MHz)</span>
        <input v-model="timerFreq" type="number" />
      </label>
      <div class="pair">
        <label>
          <span>Prescaler (PSC)</span>
          <input v-model="prescaler" type="number" placeholder="71" />
        </label>
        <label>
          <span>Period (ARR)</span>
          <input v-model="period" type="number" placeholder="999" />
        </label>
      </div>
      <button class="btn" type="button" @click="calculateTimer">计算溢出时间</button>
      <div v-if="timerResult" class="result">
        <p><span>溢出频率</span><code>{{ timerResult.freq }}</code></p>
        <p><span>溢出周期</span><code>{{ timerResult.time }}</code></p>
      </div>
    </div>

    <div class="tool card">
      <h3>进制转换</h3>
      <label>
        <span>十进制 (DEC)</span>
        <input
          type="number"
          :value="dec"
          @input="onDecChange(($event.target).value)"
        />
      </label>
      <label>
        <span>十六进制 (HEX)</span>
        <input :value="hex" @input="onHexChange(($event.target).value)" />
      </label>
      <label>
        <span>二进制 (BIN)</span>
        <input :value="bin" @input="onBinChange(($event.target).value)" />
      </label>
    </div>

    <div class="tool card">
      <h3>ASCII / HEX 互转</h3>
      <label>
        <span>文本</span>
        <textarea
          :value="asciiText"
          rows="2"
          @input="onAsciiTextChange(($event.target).value)"
        />
      </label>
      <label>
        <span>HEX 字节串</span>
        <textarea
          :value="asciiHex"
          rows="2"
          @input="onAsciiHexChange(($event.target).value)"
        />
      </label>
    </div>
  </div>
</template>

<style scoped>
.tools {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
}

.tool {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tool h3 {
  margin: 0 0 4px;
  font-size: 15px;
}

.tool label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tool label span {
  font-size: 11.5px;
  color: var(--ink-2);
}

.tool input,
.tool select,
.tool textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  font: inherit;
  font-size: 13.5px;
  color: var(--ink);
  outline: none;
}

.tool input:focus,
.tool select:focus,
.tool textarea:focus {
  border-color: var(--accent);
}

.pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.btn {
  margin-top: 2px;
  padding: 8px 14px;
  border: none;
  border-radius: 10px;
  background: var(--accent);
  color: #fff;
  font: inherit;
  font-size: 13.5px;
  font-weight: 650;
  cursor: pointer;
}

.btn:hover {
  filter: brightness(1.06);
}

.result {
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--paper);
  border: 1px solid var(--border);
}

.result p {
  margin: 0;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 12.5px;
  color: var(--ink-2);
}

.result p + p {
  margin-top: 6px;
}

.result code {
  font-family: var(--mono);
  font-weight: 700;
  color: var(--ink);
}

.result code.bad {
  color: #c0392b;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
</style>
