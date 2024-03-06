type Props = {
  text: string
}
export const Title = ({ text }: Props) => {
  return <h1 className="text-center text-2xl sm:text-4xl">{text}</h1>
}
