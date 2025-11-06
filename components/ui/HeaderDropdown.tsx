import Link from 'next/link';
import { useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import Button from './buttons/Button';
import { Z_INDEX_MAP } from '@/styles/styleConstants';

export default function HeaderDropdown() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        className="w-10 h-10 rounded-full flex items-center justify-center lg:hidden"
        onClick={handleClick}
        aria-controls={open ? 'header-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        {open ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M4.29279 4.29308C4.48031 4.10561 4.73462 4.00029 4.99979 4.00029C5.26495 4.00029 5.51926 4.10561 5.70679 4.29308L9.99979 8.58608L14.2928 4.29308C14.385 4.19757 14.4954 4.12139 14.6174 4.06898C14.7394 4.01657 14.8706 3.98898 15.0034 3.98783C15.1362 3.98668 15.2678 4.01198 15.3907 4.06226C15.5136 4.11254 15.6253 4.18679 15.7192 4.28069C15.8131 4.37458 15.8873 4.48623 15.9376 4.60913C15.9879 4.73202 16.0132 4.8637 16.012 4.99648C16.0109 5.12926 15.9833 5.26048 15.9309 5.38249C15.8785 5.50449 15.8023 5.61483 15.7068 5.70708L11.4138 10.0001L15.7068 14.2931C15.8889 14.4817 15.9897 14.7343 15.9875 14.9965C15.9852 15.2587 15.88 15.5095 15.6946 15.6949C15.5092 15.8803 15.2584 15.9855 14.9962 15.9878C14.734 15.99 14.4814 15.8892 14.2928 15.7071L9.99979 11.4141L5.70679 15.7071C5.51818 15.8892 5.26558 15.99 5.00339 15.9878C4.74119 15.9855 4.49038 15.8803 4.30497 15.6949C4.11956 15.5095 4.01439 15.2587 4.01211 14.9965C4.00983 14.7343 4.11063 14.4817 4.29279 14.2931L8.58579 10.0001L4.29279 5.70708C4.10532 5.51955 4 5.26525 4 5.00008C4 4.73492 4.10532 4.48061 4.29279 4.29308Z"
              fill="black"
            />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3 5C3 4.73478 3.10536 4.48043 3.29289 4.29289C3.48043 4.10536 3.73478 4 4 4H16C16.2652 4 16.5196 4.10536 16.7071 4.29289C16.8946 4.48043 17 4.73478 17 5C17 5.26522 16.8946 5.51957 16.7071 5.70711C16.5196 5.89464 16.2652 6 16 6H4C3.73478 6 3.48043 5.89464 3.29289 5.70711C3.10536 5.51957 3 5.26522 3 5ZM3 10C3 9.73478 3.10536 9.48043 3.29289 9.29289C3.48043 9.10536 3.73478 9 4 9H16C16.2652 9 16.5196 9.10536 16.7071 9.29289C16.8946 9.48043 17 9.73478 17 10C17 10.2652 16.8946 10.5196 16.7071 10.7071C16.5196 10.8946 16.2652 11 16 11H4C3.73478 11 3.48043 10.8946 3.29289 10.7071C3.10536 10.5196 3 10.2652 3 10ZM3 15C3 14.7348 3.10536 14.4804 3.29289 14.2929C3.48043 14.1054 3.73478 14 4 14H16C16.2652 14 16.5196 14.1054 16.7071 14.2929C16.8946 14.4804 17 14.7348 17 15C17 15.2652 16.8946 15.5196 16.7071 15.7071C16.5196 15.8946 16.2652 16 16 16H4C3.73478 16 3.48043 15.8946 3.29289 15.7071C3.10536 15.5196 3 15.2652 3 15Z"
              fill="black"
            />
          </svg>
        )}
      </Button>

      <Menu
        id="header-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{
          zIndex: Z_INDEX_MAP.dropdown,
          '& .MuiPaper-root': {
            width: 'calc(100vw - 40px)',
            maxWidth: '350px',
            borderRadius: '10px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            marginTop: '15px',
            padding: '25px 15px',
            backdropFilter: 'blur(20px)',
            background: 'rgba(255, 255, 255, 0.8)',
          },
          '& .MuiList-root': {
            padding: 0,
          },
        }}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        MenuListProps={{
          sx: {
            padding: 0,
          },
        }}
      >
        <MenuItem
          disableRipple
          sx={{
            padding: 0,
            '&:hover': { backgroundColor: 'transparent' },
          }}
        >
          <div className="flex flex-col items-center gap-[20px] w-full">
            <div className="flex flex-col items-center gap-[20px]">
              <Link
                href="https://github.com/EthereumCommunityFund/CarbonVote"
                target="_"
                onClick={handleClose}
              >
                <div className="w-[120px] flex justify-start items-center gap-[5px] opacity-60">
                  <div className="text-[16px] font-semibold">Github</div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="21"
                    height="20"
                    viewBox="0 0 21 20"
                    fill="none"
                  >
                    <g clip-path="url(#clip0_796_7496)">
                      <path
                        d="M17.3076 8.12501V8.75001C17.3063 9.80751 16.9224 10.8288 16.2268 11.6254C15.5312 12.4219 14.5709 12.9399 13.5232 13.0836C13.9509 13.6308 14.183 14.3055 14.1826 15V18.125C14.1826 18.2908 14.1168 18.4497 13.9996 18.567C13.8823 18.6842 13.7234 18.75 13.5576 18.75H8.55762C8.39186 18.75 8.23289 18.6842 8.11568 18.567C7.99847 18.4497 7.93262 18.2908 7.93262 18.125V16.875H6.05762C5.22882 16.875 4.43396 16.5458 3.84791 15.9597C3.26186 15.3737 2.93262 14.5788 2.93262 13.75C2.93262 13.2527 2.73507 12.7758 2.38344 12.4242C2.03181 12.0726 1.5549 11.875 1.05762 11.875C0.891857 11.875 0.732886 11.8092 0.615675 11.692C0.498465 11.5747 0.432617 11.4158 0.432617 11.25C0.432617 11.0842 0.498465 10.9253 0.615675 10.8081C0.732886 10.6909 0.891857 10.625 1.05762 10.625C1.468 10.625 1.87436 10.7058 2.2535 10.8629C2.63265 11.0199 2.97714 11.2501 3.26733 11.5403C3.55751 11.8305 3.78769 12.175 3.94474 12.5541C4.10179 12.9333 4.18262 13.3396 4.18262 13.75C4.18262 14.2473 4.38016 14.7242 4.73179 15.0758C5.08342 15.4275 5.56034 15.625 6.05762 15.625H7.93262V15C7.93222 14.3055 8.16434 13.6308 8.59199 13.0836C7.5443 12.9399 6.584 12.4219 5.88842 11.6254C5.19283 10.8288 4.80893 9.80751 4.80762 8.75001V8.12501C4.8154 7.34827 5.02225 6.58651 5.4084 5.91251C5.21736 5.29626 5.15608 4.64711 5.22842 4.00599C5.30076 3.36487 5.50515 2.7457 5.82871 2.18751C5.88358 2.09248 5.9625 2.01357 6.05754 1.95871C6.15258 1.90385 6.26038 1.87499 6.37012 1.87501C7.0981 1.87349 7.81634 2.04225 8.46747 2.36781C9.11859 2.69337 9.68455 3.16671 10.1201 3.75001H11.9951C12.4307 3.16671 12.9966 2.69337 13.6478 2.36781C14.2989 2.04225 15.0171 1.87349 15.7451 1.87501C15.8549 1.87499 15.9627 1.90385 16.0577 1.95871C16.1527 2.01357 16.2317 2.09248 16.2865 2.18751C16.6101 2.74569 16.8145 3.3649 16.8867 4.00604C16.9589 4.64719 16.8974 5.29634 16.7061 5.91251C17.0929 6.58624 17.3001 7.34813 17.3076 8.12501Z"
                        fill="black"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_796_7496">
                        <rect
                          width="20"
                          height="20"
                          fill="white"
                          transform="translate(0.432617)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              </Link>
              <Link
                href={'https://ecf-dev.gitbook.io/carbonvote'}
                target="_"
                onClick={handleClose}
              >
                <div className="w-[120px] flex items-center gap-[5px] opacity-60">
                  <div className="text-[16px] font-semibold">Changelog</div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="29"
                    height="29"
                    viewBox="0 0 29 29"
                    fill="none"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M10.0513 9.19305C10.0513 8.92792 10.1566 8.67367 10.3441 8.4862C10.5316 8.29873 10.7858 8.19339 11.051 8.19335L19.535 8.19335C19.8001 8.19339 20.0543 8.29873 20.2418 8.4862C20.4293 8.67367 20.5346 8.92793 20.5347 9.19305L20.5347 17.6771C20.5301 17.9392 20.4228 18.189 20.2358 18.3728C20.0488 18.5566 19.7971 18.6595 19.535 18.6595C19.2728 18.6595 19.0211 18.5566 18.8341 18.3728C18.6472 18.189 18.5398 17.9392 18.5353 17.6771L18.5353 11.6067L10.344 19.7981C10.1565 19.9856 9.90214 20.0909 9.63697 20.0909C9.37179 20.0909 9.11747 19.9856 8.92997 19.7981C8.74246 19.6105 8.63712 19.3562 8.63712 19.0911C8.63712 18.8259 8.74246 18.5716 8.92997 18.3841L17.1213 10.1927L11.051 10.1927C10.7858 10.1927 10.5316 10.0874 10.3441 9.8999C10.1566 9.71243 10.0513 9.45817 10.0513 9.19305Z"
                      fill="black"
                    />
                  </svg>
                </div>
              </Link>
            </div>
            <div className="text-black text-center text-[12px] font-semibold opacity-60 flex justify-center flex-wrap">
              Made with ❤️ and ☕️ by{' '}
              <Link
                href="https://github.com/EthereumCommunityFund"
                className="mx-[4px]"
              >
                <u>Ethereum Community Fund</u>
              </Link>{' '}
              &{' '}
              <Link
                href="https://github.com/EthereumCommunityFund/CarbonVote/graphs/contributors"
                className="mx-[4px]"
              >
                <u>Awesome contributors</u>
              </Link>
            </div>
          </div>
        </MenuItem>
      </Menu>
    </>
  );
}
