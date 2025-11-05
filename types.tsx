// types.ts
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type StackParamList = {
  Main: undefined; // Không có params cho MainScreen
  Food: { onSelect: (food: string) => void }; // Params cho FoodScreen
  Drink: { onSelect: (drink: string) => void }; // Params cho DrinkScreen
};