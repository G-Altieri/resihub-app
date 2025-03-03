// components/CustomHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter, useNavigation, usePathname } from 'expo-router';
import Constants from 'expo-constants';
// Importa i tuoi SVG
import BellIcon from '../assets/svg/campanella.svg';
import LogoSvg from '../assets/svg/logo.svg';
import ArrowBackSvg from '../assets/svg/arrowBack.svg';
import AvatarSvg from '../assets/svg/avatar.svg';

type CustomHeaderProps = {
  title: string;
};

const CustomHeader: React.FC<CustomHeaderProps> = ({ title }) => {
  const router = useRouter();
  const navigation = useNavigation();
  const pathname = usePathname();

  // Forziamo canGoBack a false se siamo sulla home (ad es. '/home')
  const isHome = pathname === '/home';
  const canGoBack = isHome ? false : navigation.canGoBack();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleBellPress = () => {
    //router.push('/notifications');
  };

  const handleAvatarPress = () => {
    //router.push('/profile');
  };

  return (
    <BlurView intensity={60} tint="dark" style={styles.headerContainer}>
      <View style={styles.leftContainer}>
        {canGoBack ? (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <ArrowBackSvg width={30} height={30} fill="#fff" />
          </TouchableOpacity>
        ) : (
          <LogoSvg width={30} height={30} fill="#fff" />
        )}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              { marginBottom: title === "Dashboard" ? -17 : -5 },
            ]}
          >
            {title}
          </Text>
        </View>
      </View>
      <View style={styles.rightContainer}>
        <TouchableOpacity onPress={handleBellPress} style={styles.iconButton}>
          <BellIcon width={26} height={26} fill="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAvatarPress} style={styles.avatarButton}>
          <AvatarSvg width={26} height={26} fill="#fff" />
        </TouchableOpacity>
      </View>
    </BlurView>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: Constants.statusBarHeight + 10,
    height: 90,
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
  },
  textContainer: {
    justifyContent: 'center',
    marginLeft: 8,
    // Il marginBottom qui non serve più, viene sovrascritto inline
  },
  title: {
    color: '#ECECEC',
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 16,
  },
  avatarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
