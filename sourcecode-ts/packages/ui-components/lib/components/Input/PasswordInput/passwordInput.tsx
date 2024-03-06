type Props = {
  onChange: (value: string) => void
}

export const PasswordInput = ({ onChange }: Props) => {
  return (
    <input
      type="password"
      onChange={(event) => onChange(event.target.value)}
      className="w-full pl-2 rounded outline outline-none focus:ring-[var(--theme-color-item-glow)] bg-[var(--theme-color-background-input)] focus:ring-4"
    />
  )
}
