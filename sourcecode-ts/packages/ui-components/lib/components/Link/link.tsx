type Props = {
  linkText: string
}

// Note - link redirection is implemented in the App, as use of "react-router-dom" links would require initializing RouteContext in storybook
export const LinkComponent = ({ linkText }: Props) => (
  <span className="inline-block hover:scale-110 hover:-rotate-12 transition-all font-bold cursor-pointer underline underline-offset-1 hover:underline-offset-4 ">
    {linkText}
  </span>
)
