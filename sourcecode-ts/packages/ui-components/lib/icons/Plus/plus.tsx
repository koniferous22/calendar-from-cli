import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

type Props = {
  variant: 'standard'
}

export const PlusIcon = ({ variant }: Props) => {
  const colorCssVar = (function () {
    switch (variant) {
      case 'standard':
        return '--theme-color-font'
    }
  })()
  return <FontAwesomeIcon icon={faPlus} className="fa-2x" color={`var(${colorCssVar})`} />
}
