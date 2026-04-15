function cFactor(n: number): number {
  if (n <= 1) return 0;
  if (n === 2) return 1;
  return 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1)) / n;
}

function buildTree(
  data: number[][],
  depth: number,
  maxDepth: number
): (sample: number[]) => number {
  if (depth >= maxDepth || data.length <= 1) {
    const size = data.length;
    return () => depth + cFactor(size);
  }

  const numFeatures = data[0].length;
  const featureIdx = Math.floor(Math.random() * numFeatures);
  const values = data.map((d) => d[featureIdx]);
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    const size = data.length;
    return () => depth + cFactor(size);
  }

  const splitVal = min + Math.random() * (max - min);
  const left = data.filter((d) => d[featureIdx] < splitVal);
  const right = data.filter((d) => d[featureIdx] >= splitVal);

  const leftFn = buildTree(left, depth + 1, maxDepth);
  const rightFn = buildTree(right, depth + 1, maxDepth);

  return (sample: number[]) =>
    sample[featureIdx] < splitVal ? leftFn(sample) : rightFn(sample);
}

function subsample(data: number[][], size: number): number[][] {
  const indices = Array.from({ length: data.length }, (_, i) => i).sort(
    () => Math.random() - 0.5
  );
  return indices.slice(0, Math.min(size, data.length)).map((i) => data[i]);
}

export function isolationForest(
  data: number[][],
  numTrees = 50,
  sampleSize = 128
): number[] {
  const n = data.length;
  if (n === 0) return [];

  const maxDepth = Math.ceil(Math.log2(Math.min(sampleSize, n)));
  const cn = cFactor(Math.min(sampleSize, n));
  const pathSums = new Array(n).fill(0);

  for (let t = 0; t < numTrees; t++) {
    const sample = subsample(data, sampleSize);
    const treeFn = buildTree(sample, 0, maxDepth);
    for (let i = 0; i < n; i++) {
      pathSums[i] += treeFn(data[i]);
    }
  }

  return pathSums.map((sum) => {
    const avgPath = sum / numTrees;
    return Math.pow(2, -avgPath / cn);
  });
}

export function adaptiveThreshold(scores: number[]): {
  threshold: number;
  mean: number;
  std: number;
} {
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance =
    scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
  const std = Math.sqrt(variance);
  return { threshold: mean + std, mean, std };
}
