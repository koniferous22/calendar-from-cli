import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

type Props = {
  variant: 'standard' | 'error' | 'warning' | 'disabled'
}

export const TimesIcon = ({ variant }: Props) => {
  const colorCssVar = (function () {
    switch (variant) {
      case 'standard':
        return '--theme-color-font'
      case 'error':
        return '--theme-color-font-error'
      case 'disabled':
        return '--theme-color-font-disabled'
      case 'warning':
        return '--theme-color-warning'
    }
  })()
  return <FontAwesomeIcon icon={faTimes} className="fa-2x" color={`var(${colorCssVar})`} />
}
