import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';

// 自定义Switch组件样式
const StyledSwitch = styled(Switch)({
  width: 44,
  height: 27,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 3,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(17px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#000000',
        opacity: 1,
        border: 0,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 21,
    height: 21,
    backgroundColor: '#ffffff',
  },
  '& .MuiSwitch-track': {
    borderRadius: 16,
    backgroundColor: '#F3F3F3',
    opacity: 1,
    border: '1px solid rgba(0, 0, 0, 0.1)',
  },
});

export default StyledSwitch;
