export interface Question {
  a: number
  b: number
  answer: number
}

/** Returns a number in [0, 1), like Math.random. Injectable for tests. */
export type Rng = () => number

export const MIN_FACTOR = 2
export const MAX_FACTOR = 10

export function makeQuestion(a: number, b: number): Question {
  return { a, b, answer: a * b }
}

function randomFactor(rng: Rng): number {
  return MIN_FACTOR + Math.floor(rng() * (MAX_FACTOR - MIN_FACTOR + 1))
}

/** Random question with factors in [MIN_FACTOR, MAX_FACTOR]. Avoids repeating `previous` pair. */
export function randomQuestion(rng: Rng = Math.random, previous?: Question): Question {
  let question = makeQuestion(randomFactor(rng), randomFactor(rng))
  if (!previous) return question
  for (let attempt = 0; attempt < 20 && samePair(question, previous); attempt++) {
    question = makeQuestion(randomFactor(rng), randomFactor(rng))
  }
  return question
}

export function samePair(x: Question, y: Question): boolean {
  return x.a === y.a && x.b === y.b
}
