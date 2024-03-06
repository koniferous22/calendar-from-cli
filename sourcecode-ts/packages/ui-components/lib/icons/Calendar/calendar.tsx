import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar } from '@fortawesome/free-solid-svg-icons'

type Props = {
  variant: 'standard'
}

export const CalendarIcon = ({ variant }: Props) => {
  const colorCssVar = (function () {
    switch (variant) {
      case 'standard':
        return '--theme-color-font'
    }
  })()
  return <FontAwesomeIcon icon={faCalendar} className="fa-2x" color={`var(${colorCssVar})`} />
}
