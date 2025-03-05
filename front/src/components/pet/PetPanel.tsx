import React from 'react'
import './style/PetPanel.scss'

export interface Pet {
  id: string
  name: string
  type: string
  birthDay: string
  imageUrl: string
}

interface PetPanelProps {
  pet: Pet
}

const PetPanel: React.FC<PetPanelProps> = ({ pet }) => {
  console.log(pet.imageUrl)
  return (
    <div className="pet-panel">
      <img src={pet.imageUrl} alt={`${pet.name}のアイコン`} className="pet-image" />
      <div className="pet-info">
        <h3>{pet.name}</h3>
        <p>種類: {pet.type}</p>
        <p>生年月日: {pet.birthDay}</p>
      </div>
    </div>
  )
}

export default PetPanel
