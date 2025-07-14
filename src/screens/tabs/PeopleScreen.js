import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl,
  Alert,
  SafeAreaView,
  Platform,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
  ToastAndroid,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import PeopleHeader from '../../components/PeopleHeader';
import PersonCard from '../../components/PersonCard';
import PromoBanner from '../../components/PromoBanner';
import CallInvitationButton from '../../components/CallInvitationButton';
import { tabs } from '../../data/dummyPeople';
import peopleService from '../../services/peopleService';
import Colors from '../../constants/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
// import Toast from 'react-native-toast-message';

// Memoized PersonCard component for better performance
const MemoizedPersonCard = memo(PersonCard);

// Animated FlatList for smooth animations
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Constants for FlatList optimization
const ITEM_HEIGHT = 230; // Approximate height of a Person Card with margin
const NUM_COLUMNS = 2;

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 2 - 16; // 2 columns with some margin

const PeopleScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [people, setPeople] = useState([]);
  const [activeTab, setActiveTab] = useState('popular');
  const [error, setError] = useState(null);
  const [banner, setBanner] = useState(null); // Add banner state
  
  // Refs for animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(0)).current;
  
  // Ref for FlatList
  const flatListRef = useRef(null);
  
  // Fetch data on mount and when tab changes
  useEffect(() => {
    fetchData();
  }, [activeTab]);
  
  // Fade-in animation when data is loaded
  useEffect(() => {
    if (!loading && people.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, people]);
  
  const fetchData = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      fadeAnim.setValue(0);
      
      const peopleResponse = await peopleService.getPeople(activeTab);
      
      if (peopleResponse.success) {
        setPeople(peopleResponse.data);
      } else {
        throw new Error('Failed to load data');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchData(true);
  };
  
  const handleTabChange = (tabId) => {
    // Only change tab if it's different from the current one
    if (tabId !== activeTab) {
      // Start a new animation cycle
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(headerY, {
          toValue: 10,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start(() => {
        setActiveTab(tabId);
        Animated.timing(headerY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  };
  
  const handlePersonPress = useCallback((person) => {
    // Navigate to user details screen
    try {
      if (!person || !person.id) {
        console.error('Invalid person object:', person);
        return;
      }
      
      // Navigate to UserDetails screen with the person's ID
      navigation.navigate('UserDetails', {
        userId: person.id
      });
    } catch (error) {
      console.error('Error navigating to user details:', error);
      setError('Failed to open user details. Please try again.');
    }
  }, [navigation]);
  
  const handleVideoCallPress = useCallback((person) => {
    // This function will be called by the CallInvitationButton component
    // The actual video call logic is handled by the CallInvitationButton component
    console.log('Video call initiated for:', person.name);
  }, []);
  
  const handleVideoCallStarted = useCallback(() => {
    console.log('Video call started successfully');
  }, []);
  
  const handleVideoCallFailed = useCallback((error) => {
    console.error('Video call failed:', error);
    // Show error toast
    ToastAndroid.show({
      type: 'error',
      text1: 'Call Failed',
      text2: error.message || 'Could not start video call',
      position: 'bottom',
      visibilityTime: 4000,
    });
  }, []);
  
  const handleBannerPress = useCallback(() => {
    if (banner?.action === 'OPEN_WALLET') {
      Alert.alert('Promotion', 'Opening wallet to add funds with 50% discount');
      // navigation.navigate('Wallet', { discount: banner.discount });
    }
  }, [banner]);
  
  const handleLocationPress = useCallback(() => {
    Alert.alert('Location', 'Opening location settings');
    // navigation.navigate('LocationSettings');
  }, []);
  
  // Optimized renderItem function with memoization
  const renderItem = useCallback(({ item, index }) => {
    // Add staggered animation for each item
    const inputRange = [
      -1, 
      0, 
      ITEM_HEIGHT * Math.floor(index / NUM_COLUMNS), 
      ITEM_HEIGHT * (Math.floor(index / NUM_COLUMNS) + 2)
    ];
    
    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.9],
      extrapolate: 'clamp',
    });
    
    const opacity = Animated.add(
      fadeAnim,
      scrollY.interpolate({
        inputRange,
        outputRange: [1, 1, 1, 0.6],
        extrapolate: 'clamp',
      })
    ).interpolate({
      inputRange: [0, 1, 2],
      outputRange: [0, 1, 1],
    });
    
    // Staggered entrance animation
    const translateY = Animated.add(
      fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [50, 0],
        extrapolate: 'clamp',
      }),
      scrollY.interpolate({
        inputRange,
        outputRange: [0, 0, 0, 20],
        extrapolate: 'clamp',
      })
    );
    
    return (
      <Animated.View 
        style={{
          transform: [
            { scale },
            { translateY }
          ],
          opacity,
        }}
      >
        <MemoizedPersonCard 
          person={item} 
          onPress={handlePersonPress}
          onVideoPress={handleVideoCallPress}
        />
      </Animated.View>
    );
  }, [fadeAnim, scrollY, handlePersonPress, handleVideoCallPress]);
  
  // Optimized header component
  const renderHeader = useCallback(() => {
    if (!banner) return null;
    
    return (
      <Animated.View 
        style={{ 
          opacity: fadeAnim,
          transform: [
            { 
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }) 
            }
          ],
          paddingHorizontal: 8, // Add consistent padding
          marginTop: 12 // Add space above the banner
        }}
      >
        <PromoBanner 
          data={banner} 
          onPress={handleBannerPress} 
        />
      </Animated.View>
    );
  }, [banner, fadeAnim, handleBannerPress]);
  
  // Header with animation for subtle parallax effect
  const renderHeaderComponent = useCallback(() => {
    return (
      <Animated.View
        style={[
          styles.headerContainer,
          {
            transform: [{
              translateY: headerY
            }]
          }
        ]}
      >
        <PeopleHeader 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLocationPress={handleLocationPress}
        />
      </Animated.View>
    );
  }, [headerY, activeTab, handleTabChange, handleLocationPress]);
  
  // getItemLayout implementation for FlatList optimization
  const getItemLayout = useCallback((data, index) => {
    const ITEM_ROW_HEIGHT = ITEM_HEIGHT;
    const rowIndex = Math.floor(index / NUM_COLUMNS);
    return {
      length: ITEM_ROW_HEIGHT,
      offset: ITEM_ROW_HEIGHT * rowIndex,
      index
    };
  }, []);
  
  // Key extractor for FlatList
  const keyExtractor = useCallback((item) => item.id, []);
  
  return (
    <LinearGradient
      colors={['#FFFFFF', '#F9F5FF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {renderHeaderComponent()}
        
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading people...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={50} color={Colors.error} style={styles.errorIcon} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => fetchData()}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : people.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={60} color={Colors.textLight} style={styles.emptyIcon} />
            <Text style={styles.emptyText}>No people found</Text>
            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={() => fetchData()}
            >
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <AnimatedFlatList
            ref={flatListRef}
            data={people}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            numColumns={NUM_COLUMNS}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[Colors.primary]}
                progressBackgroundColor="#fff"
              />
            }
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            removeClippedSubviews={true}
            getItemLayout={getItemLayout}
            bounces={true}
            bouncesZoom={true}
            alwaysBounceVertical={true}
            legacyImplementation={false}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    zIndex: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.textMedium,
  },
  listContent: {
    paddingBottom: 120, // Extra space for tab bar
    paddingHorizontal: 0, // Remove default padding to control it in individual components
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textMedium,
    marginTop: 16,
    marginBottom: 20,
  },
  emptyIcon: {
    marginBottom: 16, 
    opacity: 0.6
  },
  refreshButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  refreshText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  retryText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  }
});

export default PeopleScreen; 