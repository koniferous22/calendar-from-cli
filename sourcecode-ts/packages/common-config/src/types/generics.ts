export type RecursiveObject<T> = {
  [key: string]: T | RecursiveObject<T>
}

export type TransformObjectValues<ValueT, OutputValueT, ObjectT extends RecursiveObject<ValueT>> = {
  [K in keyof ObjectT]: ObjectT[K] extends ValueT
    ? OutputValueT
    : ObjectT[K] extends RecursiveObject<ValueT>
      ? TransformObjectValues<ValueT, OutputValueT, ObjectT[K]>
      : ObjectT[K]
}

// ┌───────────────────────────────────┐
// │                                   │
// │ "TransformObjectValues" Unit test │
// │                                   │
// └───────────────────────────────────┘

// type TestInput = {
//   a: number
//   b: number
//   c: {
//     d: number
//     e: {
//       f: number
//     }
//   }
// }

// type TestOutput = TransformObjectValues<number, string, TestInput>
