import { CredentialTable } from '@/types';

export interface VotingProcess {
  credentialId: string;
  status: string;
  contractpoll?: string;
  errorMessage?: string;
}

export interface CredentialDisplayItem {
  id: string;
  name: string;
  iconUrl: string;
  status:
    | 'pending'
    | 'active'
    | 'verifying'
    | 'signing'
    | 'sending'
    | 'pending_tx'
    | 'success'
    | 'error'
    | 'skipped'
    | 'unauthorized'
    | 'popup_disabled'
    | 'processing';
  errorMessage?: string;
}

export type VoteProcessUiState =
  | 'idle'
  | 'processing'
  | 'credential_error_awaiting_action'
  | 'ready_for_next'
  | 'all_completed_success'
  | 'all_completed_with_issues'
  | 'final_error_state';

export interface GlobalMessage {
  text: string;
  type: 'info' | 'error' | 'success';
}
