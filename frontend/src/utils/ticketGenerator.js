// Client-side ticket generator algorithm for layout testing or offline play.

export function generateTicket() {
  let ticket = null;
  let colsCount = Array(9).fill(0);
  let positions = [];
  
  while (true) {
    positions = [
      Array(9).fill(false),
      Array(9).fill(false),
      Array(9).fill(false)
    ];
    colsCount.fill(0);
    
    for (let r = 0; r < 3; r++) {
      let colsSelected = 0;
      while (colsSelected < 5) {
        const col = Math.floor(Math.random() * 9);
        if (!positions[r][col]) {
          positions[r][col] = true;
          colsCount[col]++;
          colsSelected++;
        }
      }
    }
    
    const isValid = colsCount.every(count => count >= 1 && count <= 3);
    if (isValid) {
      break;
    }
  }

  ticket = [
    Array(9).fill(null),
    Array(9).fill(null),
    Array(9).fill(null)
  ];

  for (let col = 0; col < 9; col++) {
    const minVal = col === 0 ? 1 : col * 10;
    const maxVal = col === 8 ? 90 : col * 10 + 9;
    
    const activeRows = [];
    for (let r = 0; r < 3; r++) {
      if (positions[r][col]) {
        activeRows.push(r);
      }
    }
    
    const k = activeRows.length;
    const numbersPool = [];
    for (let i = minVal; i <= maxVal; i++) {
      numbersPool.push(i);
    }
    
    const selectedNums = [];
    for (let i = 0; i < k; i++) {
      const idx = Math.floor(Math.random() * numbersPool.length);
      selectedNums.push(numbersPool.splice(idx, 1)[0]);
    }
    
    selectedNums.sort((a, b) => a - b);
    
    activeRows.forEach((r, index) => {
      ticket[r][col] = selectedNums[index];
    });
  }

  return ticket;
}
