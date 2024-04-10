import * as React from 'react';
import { FingerprintIcon } from 'lucide-react';

type CredentialProps = {
	credentials: Array<string>,
}

const Credential: React.FC<CredentialProps> = ({ credentials }) => {
	return (
		<div
			className='flex w-fit pt-1.5 pb-1.5 pr-2.5 pl-2.5 items-center content-center gap-1 flex-wrap rounded-[10px] bg-[#0000000d]'
		>
			<FingerprintIcon width='19' height='20' opacity='0.5' />
			<p className='text-sm'>
				<span className='opacity-50'>Credentials&nbsp;/&nbsp;</span>
				<span className='font-bold opacity-100'>
					{
						credentials?.length <= 3 ? credentials?.join(', ') : `${credentials?.slice(0, 3).join(', ')} + ${credentials?.length - 3}`
					}
				</span>
			</p>
		</div>
	)
}

export default Credential;