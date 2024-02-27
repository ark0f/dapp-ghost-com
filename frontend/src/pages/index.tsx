import React, { useEffect, useState } from 'react'
import { Home } from './home'
import { useAccount, useApi, useSendMessage } from '@gear-js/react-hooks'
import { Bytes } from '@polkadot/types'
import { ADDRESS } from '@/consts'
import { UserMessageSent } from '@gear-js/api'
import { useEscrowMetadata } from '@/hooks/api'
import { UnsubscribePromise } from '@polkadot/api/types'
import { decryptData, encryptData } from '@/utils'
import { useGenerateKeys } from '@/hooks/generate-rsa-key'
import { useGameMessage } from '@/features/chat/hooks'
import { Button } from '@gear-js/vara-ui'


export const App = () => {
	

	return (
		<div>
			<Home />

			


		</div>
	)
}

