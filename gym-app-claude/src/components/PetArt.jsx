import { useId } from 'react'
import { DragonArt } from './pet/Dragon'
import { MonkeyArt } from './pet/Monkey'
import { WolfArt } from './pet/Wolf'
import { TitanArt } from './pet/Titan'
import { PhoenixArt } from './pet/Phoenix'

export default function PetArt({ id, stageIndex, mood = 'idle' }) {
  const stage = Math.max(0, Math.min(3, stageIndex))
  const uid = useId().replace(/:/g, '')
  const artProps = { stage, mood, uid }
  if (id === 'monkey') return <MonkeyArt {...artProps} />
  if (id === 'wolf') return <WolfArt {...artProps} />
  if (id === 'titan') return <TitanArt {...artProps} />
  if (id === 'phoenix') return <PhoenixArt {...artProps} />
  return <DragonArt {...artProps} />
}
