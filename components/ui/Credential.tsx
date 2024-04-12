import * as React from 'react';
import { FingerprintIcon } from 'lucide-react';

type CredentialProps = {
	credentials: Array<string | undefined>,
}

const Credential: React.FC<CredentialProps> = ({ credentials }) => {
	return (
		<div
			className='flex w-fit pt-1.5 pb-1.5 pr-2.5 pl-2.5 items-start content-center gap-1 rounded-[10px] bg-[#0000000d]'
		>
			<div className="h-fit">
				<FingerprintIcon width='19' height='20' opacity='0.5' />
			</div>
			<p className='text-sm'>
				<span className='opacity-50 font-700'>Credentials&nbsp;/&nbsp;</span>
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