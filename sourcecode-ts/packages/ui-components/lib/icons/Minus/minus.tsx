import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinus } from '@fortawesome/free-solid-svg-icons'

type Props = {
  variant: 'standard' | 'inactive'
}

export const MinusIcon = ({ variant }: Props) => {
  const colorCssVar = (function () {
    switch (variant) {
      case 'standard':
        return '--theme-color-font'
      case 'inactive':
        return '--theme-color-font-disabled'
    }
  })()
  return <FontAwesomeIcon icon={faMinus} className="fa-2x" color={`var(${colorCssVar})`} />
}
