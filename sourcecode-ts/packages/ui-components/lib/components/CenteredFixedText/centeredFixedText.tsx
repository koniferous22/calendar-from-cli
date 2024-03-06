type Props = {
  text: string
}

export const CenteredFixedText = ({ text }: Props) => {
  return (
    <div className="fixed w-full h-full flex items-center justify-center">
      <div>{text}</div>
    </div>
  )
}
