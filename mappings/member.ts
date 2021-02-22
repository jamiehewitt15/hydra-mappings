import { SubstrateEvent, DB } from '../generated/hydra-processor'
import { Member } from '../generated/graphql-server/src/modules/member/member.model'

export async function members_MembersCreated(db: DB, event: SubstrateEvent) {
  const [id] = event.params
  const member = new Member()
  member.id = id.value as string
  await db.save<Member>(member)
}