const crypto = require("crypto");

// Generates a grid of booleans from a hash
//
// Precondition: hash is a hex string
function generateGridFromHash(gridSize, hash) {
  const grid = [];

  for (let i = 0; i < gridSize; i++) {
    grid[i] = [];
    for (let j = 0; j < gridSize; j++) {
      const index = i * gridSize + j;
      grid[i][j] = hash[index % hash.length] >= "7";
    }
  }

  return grid;
}

function getColorFromHashChar(hashChar) {
  const color = parseInt(hashChar, 16);
  return `bg-hash-${color}`;
}

module.exports = function (slug) {
  const hash = crypto.createHash("sha512").update(slug).digest("hex");
  const grid = generateGridFromHash(8, hash);
  const colorClass = getColorFromHashChar(hash[16]);
  console.log(hash.length);

  let output = '<div class="grid grid-cols-8 w-full h-full">';

  grid.forEach((row) => {
    row.forEach((cell) => {
      const color = cell ? colorClass : "bg-transparent";
      output += `<div class="${color}"></div>`;
    });
  });

  output += "</div>";
  return output;
};
