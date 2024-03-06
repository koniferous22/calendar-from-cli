import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'

type Props = {
  isDisabled?: boolean
}

export const ChevronPrev = ({ isDisabled }: Props) => {
  const colorCssVar = isDisabled ? '--theme-color-font-disabled' : '--theme-color-font'
  return <FontAwesomeIcon icon={faChevronLeft} className="fa-2x" color={`var(${colorCssVar})`} />
}
