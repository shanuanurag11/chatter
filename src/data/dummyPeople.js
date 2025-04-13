// Dummy data for the People screen
// This structure mimics what would come from an API

export const dummyPeople = [
  {
    id: '1',
    name: 'cuties',
    username: 'cuties',
    avatar: 'https://randomuser.me/api/portraits/women/23.jpg',
    isOnline: true,
    country: 'in', // India flag
    hasVideo: true,
    status: 'online',
    lastActive: new Date(),
    bio: 'Life is beautiful ✨',
    isVerified: true,
  },
  {
    id: '2',
    name: 'user3dSZG',
    username: 'user3dSZG',
    avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
    isOnline: false,
    country: null,
    hasVideo: true,
    status: 'offline',
    lastActive: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
    bio: 'Just browsing around',
  },
  {
    id: '3',
    name: 'areesha khan',
    username: 'areesha_khan',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    isOnline: true,
    country: 'pk', // Pakistan flag
    hasVideo: true,
    status: 'online',
    lastActive: new Date(),
    bio: 'Love traveling and meeting new people',
  },
  {
    id: '4',
    name: 'mano',
    username: 'mano_95',
    avatar: 'https://randomuser.me/api/portraits/women/66.jpg',
    isOnline: true,
    country: 'in', // India flag
    hasVideo: true,
    status: 'online',
    lastActive: new Date(),
    bio: 'Music lover 🎵',
  },
  {
    id: '5',
    name: 'Priya',
    username: 'priya_official',
    avatar: 'https://randomuser.me/api/portraits/women/79.jpg',
    isOnline: true,
    country: 'in',
    hasVideo: true,
    status: 'online',
    lastActive: new Date(),
    bio: 'Live, laugh, love ❤️',
  },
  {
    id: '6',
    name: 'Aisha',
    username: 'aisha_1995',
    avatar: 'https://randomuser.me/api/portraits/women/81.jpg',
    isOnline: true,
    country: 'in',
    hasVideo: true,
    status: 'online',
    lastActive: new Date(),
    bio: 'Looking for friends',
  },
  {
    id: '7',
    name: 'Sara',
    username: 'sara_smiles',
    avatar: 'https://randomuser.me/api/portraits/women/90.jpg',
    isOnline: false,
    country: 'us',
    hasVideo: true,
    status: 'offline',
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    bio: 'Adventure seeker',
  },
  {
    id: '8',
    name: 'Nisha',
    username: 'nisha_2000',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    isOnline: false,
    country: 'in',
    hasVideo: false,
    status: 'away',
    lastActive: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    bio: 'Photography enthusiast 📷',
  },
];

// We'll use an image URL since we don't have a local image
export const bannerData = {
  id: 'promo-001',
  title: 'Cheaper',
  discount: '50% OFF',
  // Use a placeholder image URL instead of requiring a local file
  imageUrl: 'https://cdn-icons-png.flaticon.com/512/6475/6475889.png',
  buttonText: 'Get Now',
  backgroundColor: '#D437A3', // Pink color from the design
  action: 'OPEN_WALLET'
};

export const tabs = [
  {
    id: 'popular',
    title: 'Popular'
  },
  {
    id: 'new',
    title: 'New'
  }
]; 