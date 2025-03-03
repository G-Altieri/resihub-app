// backgrounds.ts
import { ImageSourcePropType } from 'react-native';

const backgrounds: Record<string, ImageSourcePropType> = {
  energia: require('../assets/images/SfondoEnergia.jpg'),
  calore: require('../assets/images/SfondoCalore.jpg'),
  ambiente: require('../assets/images/SfondoAmbiente.jpg'),
  colonnine: require('../assets/images/SfondoColonnine.jpg'),
  dispositivi: require('../assets/images/SfondoDispositivi.jpg'),
  profilo: require('../assets/images/SfondoProfilo.jpg'),
  default: require('../assets/images/SfondoEnergia.jpg'),
};

const getBackgroundImage = (tipo?: string): ImageSourcePropType => {
  if (tipo) {
    const lowerType = tipo.toLowerCase();
    return backgrounds[lowerType] || backgrounds.default;
  }
  return backgrounds.default;
};

export { backgrounds, getBackgroundImage };
