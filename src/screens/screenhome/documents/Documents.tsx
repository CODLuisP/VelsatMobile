import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../../../components/ScaledComponents';

const Documents: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Documentos</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#05255d',
  },
});

export default Documents;