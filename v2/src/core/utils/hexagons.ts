// Helper to generate hex coordinates in a spiral (BFS) to fill from center
export const getHexPositions = (count: number): { q: number; r: number }[] => {
  const positions: { q: number; r: number }[] = [];
  const visited = new Set<string>();
  const queue: { q: number; r: number }[] = [{ q: 0, r: 0 }];

  visited.add("0,0");

  const directions = [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
  ];

  while (positions.length < count && queue.length > 0) {
    const current = queue.shift()!;
    positions.push(current);

    for (const dir of directions) {
      const nextQ = current.q + dir.q;
      const nextR = current.r + dir.r;
      const key = `${nextQ},${nextR}`;

      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ q: nextQ, r: nextR });
      }
    }
  }

  return positions;
};
