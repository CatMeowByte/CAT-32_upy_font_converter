// Util
function out(n){console.log(n)}
function $(n){return document.getElementById(n)}

// Global
var DATA_IMAGE = null;
var DATA_NAME = null;
var DATA_NAME_CODE = null;
var DATA_CHAR_W = null;
var DATA_CHAR_H = null;
var DATA_CHARSET = null;

const INPUT_IMAGE = $("INPUT_IMAGE");
const INPUT_IMAGE_LABEL = $("INPUT_IMAGE_LABEL");
const INPUT_NAME = $("INPUT_NAME");
const INPUT_NAME_CODE = $("INPUT_NAME_CODE");
const INPUT_COMMENT = $("INPUT_COMMENT");
const INPUT_CHAR_WIDTH = $("INPUT_CHAR_WIDTH");
const INPUT_CHAR_HEIGHT = $("INPUT_CHAR_HEIGHT");
const INPUT_CHARSET = $("INPUT_CHARSET");
const INPUT_UPDATE = $("INPUT_UPDATE");

const HIDDEN_PREVIEW = $("HIDDEN_PREVIEW");

const IMAGE_PREVIEW = $("IMAGE_PREVIEW");
const SLICE_GRID = $("SLICE_GRID");

const CODE_PREVIEW = $("CODE_PREVIEW");
const CODE_DOWNLOAD = $("CODE_DOWNLOAD");

INPUT_IMAGE.addEventListener("change", cb_image_load);
INPUT_UPDATE.addEventListener("click", cb_update);

CODE_DOWNLOAD.addEventListener("click", cb_download);

function is_valid_variable_name(str) {
  // Regular expression to check if the string is a valid variable name
  const regex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
  return regex.test(str);
}

function image_to_bitarray(ctx) {
  let bit_raw = ""
  for (let y = 0; y < DATA_IMAGE.height; y++) {
    for (let x = 0; x < DATA_IMAGE.width; x++) {
      const pix = ctx.getImageData(x, y, 1, 1).data;
      const is_black = pix[0] === 0 && pix[1] === 0 && pix[2] === 0 && pix[3] === 255;
      bit = is_black ? "1" : "0";
      bit_raw += bit;
    }
  }
  return bit_raw;
}

function slice_draw() {
  SLICE_GRID.innerHTML = "";
  for (let y = 0; y < (DATA_IMAGE.height / DATA_CHAR_H); y++) {
    const row = document.createElement("tr");
    for (let x = 0; x < (DATA_IMAGE.width / DATA_CHAR_W); x++) {
      let idx = (y*(DATA_IMAGE.width/DATA_CHAR_W)) + x;

      // Skip if over charset length
      if (idx >= DATA_CHARSET.length) {continue}

      const cell = document.createElement("td");
        cell.classList.add("slice-cell");
        cell.textContent = DATA_CHARSET[(y * (DATA_IMAGE.width/DATA_CHAR_W)) + x];
        row.appendChild(cell);
    }
    SLICE_GRID.appendChild(row);
  }
}

function code_write(bit) {
  // Write as is, newline separated
  // Remove space
  let list = [];
  let text = "";

  // Util
  function write(str) {text += str + "\n"}

  // Name
  write("# " + DATA_NAME);

  // Comment (optional)
  if (INPUT_COMMENT.value) {
    write("# " + INPUT_COMMENT.value);
  }

  // Space
  write("");

  // Object
  write(DATA_NAME_CODE + " = _CAT32_font()");

  // Space
  write("");

  // Class
  write("class _CAT32_font:");

  // Init
  write(" def __init__(self):");

  // W
  write("  self._w = " + DATA_CHAR_W);

  // H
  write("  self._h = " + DATA_CHAR_H);

  // Char begin
  write("  self._char = {");

  // Per char
  for (let ty = 0; ty < (DATA_IMAGE.height / DATA_CHAR_H); ty++) {
    for (let tx = 0; tx < (DATA_IMAGE.width / DATA_CHAR_W); tx++) {
      let idx = (ty*(DATA_IMAGE.width/DATA_CHAR_W)) + tx;
      let ord = DATA_CHARSET.charCodeAt(idx);

      // Skip if over charset length
      if (idx >= DATA_CHARSET.length || list.includes(ord)) {continue}

      // Skip if space
      if (ord == 32) {continue}

      list.push(ord);
      text += "   " + ord + ": 0b";
      // Per pixel
      for (let py = 0; py < DATA_CHAR_H; py++) {
        for (let px = 0; px < DATA_CHAR_W; px++) {
          let pos_x = (tx * DATA_CHAR_W) + px
          let pos_y = DATA_IMAGE.width * ((ty*DATA_CHAR_H) + py)
          text += bit[pos_x + pos_y];
        }
      }
      text += ", # " + DATA_CHARSET[idx];
      text += "\n";
    }
  }

  // Char end
  write("  }");

  // Space
  write("");

  // W
  write(" @property");
  write(" def w(self): return self._w");

  // Space
  write("");

  // H
  write(" @property");
  write(" def h(self): return self._h");

  // Space
  write("");

  // Char
  write(" @property");
  text += " def char(self): return self._char";

  return text;
}

function download_file(name, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function cb_image_load(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.src = e.target.result;
    // Ensure proper execution
    img.onload = () => {
      DATA_IMAGE = img;
      INPUT_IMAGE_LABEL.textContent = "Loaded: " + file.name;
    };
  };
  reader.readAsDataURL(file);
}

function cb_download() {
  const file_name = "font_" + DATA_NAME_CODE + ".py";
  const content = CODE_PREVIEW.textContent;
  download_file(file_name, content);
}

function cb_update() {
  // Get value
  DATA_NAME = INPUT_NAME.value;
  DATA_NAME_CODE = INPUT_NAME_CODE.value;
  DATA_CHAR_W = parseInt(INPUT_CHAR_WIDTH.value);
  DATA_CHAR_H = parseInt(INPUT_CHAR_HEIGHT.value);
  DATA_CHARSET = INPUT_CHARSET.value.replace(/\r?\n|\r/g, "");

  // Check
  console.log("DATA_IMAGE:", DATA_IMAGE);
  console.log("DATA_NAME:", DATA_NAME);
  console.log("DATA_NAME_CODE:", DATA_NAME_CODE);
  console.log("DATA_CHAR_W:", DATA_CHAR_W);
  console.log("DATA_CHAR_H:", DATA_CHAR_H);
  console.log("DATA_CHARSET:", DATA_CHARSET);

  if (!DATA_IMAGE || !DATA_NAME || !DATA_NAME_CODE || !DATA_CHAR_W || !DATA_CHAR_H || !DATA_CHARSET) {
    alert("Image file and parameter must be provided!");
    return;
  }

  if (!is_valid_variable_name(DATA_NAME_CODE)) {
    alert("Code name must be a valid variable name!");
    return;
  }

  // Unhide preview
  HIDDEN_PREVIEW.classList.remove("hidden");

  // Display the preview image
  IMAGE_PREVIEW.src = DATA_IMAGE.src;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = DATA_IMAGE.width;
  canvas.height = DATA_IMAGE.height;
  ctx.drawImage(DATA_IMAGE, 0, 0, DATA_IMAGE.width, DATA_IMAGE.height);

  // Draw slice
  slice_draw();

  // Iterate over each row and column for black opaque pixels
  let bit = image_to_bitarray(ctx);

  // Show result
  CODE_PREVIEW.textContent = code_write(bit);
}