// PetPanel.tsx
import { reverseSpeciesMap } from '@/constants/petSpecies';
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import z from 'zod'

export const petSchema = z.object({
    id: z.string().uuid(),
    imageUrl: z.string().min(1),
    name: z.string().min(1),
    type: z.string().min(1),
    species: z.string().min(1),
  });


  type Pet = z.infer<typeof petSchema>;

type PetPanelProps = {
  pet: Pet;
};

export const PetPanel: React.FC<PetPanelProps> = ({ pet }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: pet.imageUrl }} style={styles.icon} />
      <View style={styles.info}>
        <Text style={styles.name}>{pet.name}</Text>
        <Text style={styles.species}>{reverseSpeciesMap[pet.type][pet.species]}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#f5f5f5",
    padding: 10,
    height: 200,
    borderRadius: 25,
    borderColor: 'rgba(0, 0, 0, 0.3)',
  },
  icon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
  },
  info: {
    marginLeft: 10,
  },
  name: {
    padding: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },
  species: {
    fontSize: 14,
    color: '#666',
  },
});

export default PetPanel;
