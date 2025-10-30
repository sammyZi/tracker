import { registerRootComponent } from 'expo';

import App from './App';

// Import background location task to register it
// This must be imported before the app is registered
import './src/services/location/BackgroundLocationTask';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
