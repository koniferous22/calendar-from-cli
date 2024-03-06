import { RecursiveObject, TransformObjectValues } from '../types/generics.js'

export const transformRecursiveObject = <
  InputAttributeT,
  OutputAttributeT,
  InputObjectT extends RecursiveObject<InputAttributeT>,
>(
  object: InputObjectT,
  transform: (inputValue: InputAttributeT) => OutputAttributeT,
): TransformObjectValues<InputAttributeT, OutputAttributeT, InputObjectT> => {
  return null as any
}
