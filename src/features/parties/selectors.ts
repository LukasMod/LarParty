import { Party } from '@/features/parties/types'

export function getPartyById(parties: Party[], partyId: string): Party | null {
  return parties.find((party) => party.id === partyId) ?? null
}
