import Link from "next/link";
import { Dispatch, SetStateAction } from "react";

interface HeaderDropdownPropTypes {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function HeaderDropdown({ open, setOpen }: HeaderDropdownPropTypes) {
    return (
        open ?
            <div className="w-screen px-[37px] block lg:hidden absolute left-0 top-[65px] z-10">
                <div className="w-full border border-collapse border-[#0000001A] bg-[#FFFFFFCC] rounded-[10px] px-[15px] py-[25px] backdrop-blur-[20px] flex flex-col items-center gap-[20px]">
                    <div className="flex flex-col gap-[20px]">
                        <Link href={"/"}>
                            <div className="flex items-center gap-[5px] opacity-60" onClick={() => setOpen(false)}>
                                <div className="text-[16px] font-semibold">
                                    Docs
                                </div>
                                <svg width="29" height="30" viewBox="0 0 29 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M10.0415 10.051C10.0415 9.78584 10.1469 9.53158 10.3344 9.34411C10.5218 9.15664 10.7761 9.0513 11.0412 9.05126L19.5252 9.05126C19.7903 9.0513 20.0446 9.15664 20.2321 9.34411C20.4195 9.53158 20.5249 9.78584 20.5249 10.051L20.5249 18.535C20.5203 18.7971 20.413 19.0469 20.226 19.2307C20.039 19.4145 19.7874 19.5174 19.5252 19.5174C19.263 19.5174 19.0114 19.4145 18.8244 19.2307C18.6374 19.0469 18.5301 18.7971 18.5255 18.535L18.5255 12.4647L10.3342 20.656C10.1467 20.8435 9.89238 20.9488 9.6272 20.9488C9.36202 20.9488 9.10771 20.8435 8.9202 20.656C8.73269 20.4685 8.62735 20.2141 8.62735 19.949C8.62735 19.6838 8.73269 19.4295 8.9202 19.242L17.1115 11.0507L11.0412 11.0507C10.7761 11.0506 10.5218 10.9453 10.3344 10.7578C10.1469 10.5703 10.0415 10.3161 10.0415 10.051Z" fill="black" />
                                </svg>
                            </div>
                        </Link>
                        <Link
                            href="https://github.com/EthereumCommunityFund/CarbonVote"
                            target="_"
                        >
                            <div className="flex items-center gap-[5px] opacity-60" onClick={() => setOpen(false)}>
                                <div className="text-[16px] font-semibold" >
                                    Github
                                </div>
                                <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clip-path="url(#clip0_796_7743)">
                                        <path d="M17.3076 8.12501V8.75001C17.3063 9.80751 16.9224 10.8288 16.2268 11.6254C15.5312 12.4219 14.5709 12.9399 13.5232 13.0836C13.9509 13.6308 14.183 14.3055 14.1826 15V18.125C14.1826 18.2908 14.1168 18.4497 13.9996 18.567C13.8823 18.6842 13.7234 18.75 13.5576 18.75H8.55762C8.39186 18.75 8.23289 18.6842 8.11568 18.567C7.99847 18.4497 7.93262 18.2908 7.93262 18.125V16.875H6.05762C5.22882 16.875 4.43396 16.5458 3.84791 15.9597C3.26186 15.3737 2.93262 14.5788 2.93262 13.75C2.93262 13.2527 2.73507 12.7758 2.38344 12.4242C2.03181 12.0726 1.5549 11.875 1.05762 11.875C0.891857 11.875 0.732886 11.8092 0.615675 11.692C0.498465 11.5747 0.432617 11.4158 0.432617 11.25C0.432617 11.0842 0.498465 10.9253 0.615675 10.8081C0.732886 10.6909 0.891857 10.625 1.05762 10.625C1.468 10.625 1.87436 10.7058 2.2535 10.8629C2.63265 11.0199 2.97714 11.2501 3.26733 11.5403C3.55751 11.8305 3.78769 12.175 3.94474 12.5541C4.10179 12.9333 4.18262 13.3396 4.18262 13.75C4.18262 14.2473 4.38016 14.7242 4.73179 15.0758C5.08342 15.4275 5.56034 15.625 6.05762 15.625H7.93262V15C7.93222 14.3055 8.16434 13.6308 8.59199 13.0836C7.5443 12.9399 6.584 12.4219 5.88842 11.6254C5.19283 10.8288 4.80893 9.80751 4.80762 8.75001V8.12501C4.8154 7.34827 5.02225 6.58651 5.4084 5.91251C5.21736 5.29626 5.15608 4.64711 5.22842 4.00599C5.30076 3.36487 5.50515 2.7457 5.82871 2.18751C5.88358 2.09248 5.9625 2.01357 6.05754 1.95871C6.15258 1.90385 6.26038 1.87499 6.37012 1.87501C7.0981 1.87349 7.81634 2.04225 8.46747 2.36781C9.11859 2.69337 9.68455 3.16671 10.1201 3.75001H11.9951C12.4307 3.16671 12.9966 2.69337 13.6478 2.36781C14.2989 2.04225 15.0171 1.87349 15.7451 1.87501C15.8549 1.87499 15.9627 1.90385 16.0577 1.95871C16.1527 2.01357 16.2317 2.09248 16.2865 2.18751C16.6101 2.74569 16.8145 3.3649 16.8867 4.00604C16.9589 4.64719 16.8974 5.29634 16.7061 5.91251C17.0929 6.58624 17.3001 7.34813 17.3076 8.12501Z" fill="black" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_796_7743">
                                            <rect width="20" height="20" fill="white" transform="translate(0.432617)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </div>
                        </Link>
                        <Link href={"/"}>
                            <div className="flex items-center gap-[5px] opacity-60" onClick={() => setOpen(false)}>
                                <div className="text-[16px] font-semibold">
                                    Changelog
                                </div>
                                <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M10.0513 9.19305C10.0513 8.92792 10.1566 8.67367 10.3441 8.4862C10.5316 8.29873 10.7858 8.19339 11.051 8.19335L19.535 8.19335C19.8001 8.19339 20.0543 8.29873 20.2418 8.4862C20.4293 8.67367 20.5346 8.92793 20.5347 9.19305L20.5347 17.6771C20.5301 17.9392 20.4228 18.189 20.2358 18.3728C20.0488 18.5566 19.7971 18.6595 19.535 18.6595C19.2728 18.6595 19.0211 18.5566 18.8341 18.3728C18.6472 18.189 18.5398 17.9392 18.5353 17.6771L18.5353 11.6067L10.344 19.7981C10.1565 19.9856 9.90214 20.0909 9.63697 20.0909C9.37179 20.0909 9.11747 19.9856 8.92997 19.7981C8.74246 19.6105 8.63712 19.3562 8.63712 19.0911C8.63712 18.8259 8.74246 18.5716 8.92997 18.3841L17.1213 10.1927L11.051 10.1927C10.7858 10.1927 10.5316 10.0874 10.3441 9.8999C10.1566 9.71243 10.0513 9.45817 10.0513 9.19305Z" fill="black" />
                                </svg>
                            </div>
                        </Link>
                    </div>
                    <div className="text-black text-center text-[12px] font-semibold opacity-60">
                        Made with ❤️ and ☕️ by <Link href=""><u>Ethereum Community Fund</u></Link> & <Link href=""><u>Awesome contributors</u></Link>
                    </div>
                </div>
            </div>
            : <></>
    )
}